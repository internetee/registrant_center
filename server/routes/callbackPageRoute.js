/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
import axios from 'axios';
import qs from 'qs';
import jwt from 'jsonwebtoken';
import soapRequest from 'easy-soap-request';
import moment from 'moment';
import capitalize from 'capitalize';
import User from '../utils/UserSchema';

dotenv.config();

const {
    HOST,
    PORT,
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL,
    TOKEN_PATH,
    ISSUER_URL,
    AR_URL,
    AR_USER,
    AR_PASS,
} = process.env;

const B64_VALUE = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const getCompanies = async (ident) => {
    try {
        const url = AR_URL;
        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            soapAction: 'https://demo-ariregxmlv6.rik.ee/?wsdl',
            'user-agent': 'sampleTest',
        };
        const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xro="http://x-road.eu/xsd/xroad.xsd" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:prod="http://arireg.x-road.eu/producer/">
      <soapenv:Body>
        <prod:detailandmed_v1>
          <prod:keha>
            <prod:ariregister_kasutajanimi>${AR_USER}</prod:ariregister_kasutajanimi>
            <prod:ariregister_parool>${AR_PASS}</prod:ariregister_parool>
            <prod:ariregister_valjundi_formaat>json</prod:ariregister_valjundi_formaat>
            <prod:fyysilise_isiku_kood>${ident}</prod:fyysilise_isiku_kood>
            <prod:yandmed>1</prod:yandmed>
            <prod:iandmed>0</prod:iandmed>
            <prod:kandmed>0</prod:kandmed>
            <prod:dandmed>0</prod:dandmed>
            <prod:maarused>0</prod:maarused>
          </prod:keha>
        </prod:detailandmed_v1>
      </soapenv:Body>
    </soapenv:Envelope>`;
        const response = await soapRequest(url, headers, xml);
        if (response && response.body) {
            const {
                response: { body },
            } = response;
            if (body && body.keha && body.keha.leitud_ettevotjate_arv > 0) {
                return (
                    body.keha.ettevotjad &&
                    body.keha.ettevotjad.item.map((item) => ({
                        ariregistri_kood: item.ariregistri_kood,
                        nimi: item.nimi,
                        yldandmed: {
                            aadressid: item.yldandmed.aadressid.item,
                            sidevahendid: item.yldandmed.sidevahendid.item,
                        },
                    }))
                );
            }
        }
        return [];
    } catch (e) {
        console.log('AR REQ error:', e); // eslint-disable-line no-console
        return e;
    }
};

const setUserSession = (req, ident, firstName, lastName) => {
    req.session.user = {
        first_name: firstName,
        ident,
        last_name: lastName,
    };
};

export default async function (req, res, publicKey) {
    try {
        if (req.query.error) {
            throw new Error(req.query.error);
        }

        /* Võta päringu query-osast TARA poolt saadetud volituskood (authorization code) */
        const { code } = req.query;

        /*
     Turvaelemendi state kontroll
    */
        const returnedState = req.query.state;
        const sessionState = req.session.grant.state;
        if (returnedState !== sessionState) {
            throw new Error('Request query state and session state do not match.');
        }
        const options = {
            data: qs.stringify({
                code,
                grant_type: 'authorization_code',
                redirect_uri: `https://${HOST}:${PORT}${REDIRECT_URL}`,
            }),
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                Authorization: `Basic ${B64_VALUE}`,
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
            method: 'POST',
            url: ISSUER_URL + TOKEN_PATH,
        };
        const {
            data: { id_token },
        } = await axios(options); // eslint-disable-line camelcase

        /*
     Identsustõendi kontrollimine. Teegi jsonwebtoken
     abil kontrollitakse allkirja, tõendi saajat (aud), tõendi
     väljaandjat (iss) ja tõendi kehtivust (nbf ja exp).
     Vt https://www.npmjs.com/package/jsonwebtoken
    */
        // remove the cookie
        res.clearCookie('connect.sid', {
            domain: HOST,
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: true,
        });

        jwt.verify(
            id_token,
            publicKey,
            {
                audience: CLIENT_ID,
                clockTolerance: 10,
                issuer: ISSUER_URL,
            },
            (err, verifiedJwt) => {
                if (err) {
                    throw new Error(err);
                }
                const userData = {
                    first_name: capitalize.words(verifiedJwt.profile_attributes.given_name),
                    ident: verifiedJwt.sub.replace(/\D/g, ''),
                    last_name: capitalize.words(verifiedJwt.profile_attributes.family_name),
                };

                User.findOne({
                    ident: userData.ident,
                })
                    .then(async (user) => {
                        const today = moment(Date.now());
                        const updatedAt = moment((user && user.updated_at) || new Date());
                        let userObj = {
                            first_name: userData.first_name,
                            ident: userData.ident,
                            last_name: userData.last_name,
                            updated_at: Date.now(),
                            visited_at: Date.now(),
                        };
                        if (today.diff(updatedAt, 'days') > 1 || !user) {
                            getCompanies(userData.ident).then((companies) => {
                                userObj = {
                                    ...userObj,
                                    companies,
                                };
                            });
                        }

                        if (user) {
                            User.updateOne({ _id: user._id }, userObj, (error) => {
                                if (error) {
                                    throw new Error(error);
                                }
                            });
                        } else {
                            User.create(userObj, (error) => {
                                if (error) {
                                    throw new Error(error);
                                }
                            });
                        }
                        setUserSession(
                            req,
                            userData.ident,
                            userData.first_name,
                            userData.last_name
                        );
                        res.redirect('/');
                    })
                    .catch((e) => console.error(`Failed to find user: ${e}`));
            }
        );
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
        res.redirect('/login');
    }
}
