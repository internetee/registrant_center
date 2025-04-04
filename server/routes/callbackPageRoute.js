/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import qs from 'qs';
import jwt from 'jsonwebtoken';
import capitalize from 'capitalize';
import { logDebug, logInfo, logError } from '../utils/logger.js';

const {
    CLIENT_ID,
    CLIENT_SECRET,
    HOST,
    PORT,
    ISSUER_URL,
    NODE_ENV,
    VITE_SERVER_PORT,
    REDIRECT_URL,
    TOKEN_PATH,
} = process.env;

const B64_VALUE = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const redirect_uri =
    NODE_ENV === 'development'
        ? `https://${HOST}:${VITE_SERVER_PORT}${REDIRECT_URL}`
        : `https://${HOST}${REDIRECT_URL}`;

export default async function callbackPageRoute(req, res, publicKey) {
    try {
        if (req.query.error) {
            throw new Error(req.query.error);
        }

        // Võta päringu query-osast EEID poolt saadetud volituskood (authorization code)
        const { code } = req.query;

        // Turvaelemendi state kontroll
        const returnedState = req.query.state;
        const sessionState = req.session.grant.state;
        if (returnedState !== sessionState) {
            throw new Error('Request query state and session state do not match.');
        }
        const options = {
            data: qs.stringify({
                code,
                grant_type: 'authorization_code',
                redirect_uri,
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
        } = await axios(options);

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
                    country_code: get_user_country_code(verifiedJwt.sub),
                    first_name: capitalize.words(verifiedJwt.profile_attributes.given_name),
                    ident: get_user_ident(verifiedJwt.sub),
                    last_name: capitalize.words(verifiedJwt.profile_attributes.family_name),
                };

                logDebug('Decrypted JWT from TARA:', { verifiedJwt });
                logInfo('User logged in successfully!');

                req.session.user = userData;
                if (NODE_ENV === 'development') {
                    res.redirect(`http://${HOST}:${PORT}`);
                } else {
                    res.redirect('/');
                }
            }
        );
    } catch (e) {
        logError('Authentication failed', e);
        if (process.env.NODE_ENV !== 'test') {
            console.warn(e);
        }
        if (NODE_ENV === 'development') {
            res.redirect(`http://${HOST}:${PORT}/login`);
        } else {
            res.redirect('/login');
        }
    }
}

export const get_user_ident = (ident) => ident.substr(2);

export const get_user_country_code = (ident) => ident.substr(0, 2);
