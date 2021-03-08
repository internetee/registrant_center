/* eslint-disable sort-keys */
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false,
});

const instance = axios.create({
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    httpsAgent: agent,
    validateStatus: (status) => status >= 200 && status < 300,
});

export default {
    fetchMenu: (type) => {
        return axios({
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
            method: 'GET',
            url: `/api/menu/${type}`,
        });
    },
    fetchUser: () => {
        return axios.get('/api/user', {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
            method: 'GET',
            timeout: 15000,
        });
    },

    destroyUser: () => {
        return axios.post(
            '/api/destroy',
            {},
            {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                httpsAgent: agent,
            }
        );
    },

    fetchVerification: (domain, token, type) => {
        return instance.get(`/api/confirms/${domain}/${type}/${token}`, {
            credentials: 'include',
            method: 'GET',
            timeout: 4000,
        });
    },

    sendVerificationResponse: (name, token, action, type) => {
        return instance.post(`/api/confirms/${name}/${type}/${token}/${action}`, {
            credentials: 'include',
            method: 'POST',
            timeout: 4000,
        });
    },

    fetchDomains: (uuid = false, offset, simplify = true, tech = false) => {
        if (uuid) {
            const d = instance.get(`/api/domains/${uuid}`);
            console.log('Domain ', d);
            return d;
        }
        if (simplify) {
            if (tech) {
                const d = instance.get(`/api/domains?offset=${offset}&simple=true&tech=true`);
                console.log('Domain: ', d);
                return d;
            }
            return instance.get(`/api/domains?offset=${offset}&simple=true`);
        }
        if (tech) return instance.get(`/api/domains?offset=${offset}&simple=true&tech=true`);
        return instance.get(`/api/domains?offset=${offset}`);
    },

    fetchCompanies: (offset) => {
        return instance.get(`/api/companies?offset=${offset}`);
    },

    fetchContacts: (uuid = false, offset = false, linked = false) => {
        if (uuid) {
            if (linked) {
                return instance.get(`/api/contacts/${uuid}?links=true`);
            }
            return instance.get(`/api/contacts/${uuid}`);
        }
        return instance.get(`/api/contacts?offset=${offset}`);
    },
    updateContact: (uuid, form) => instance.patch(`/api/contacts/${uuid}`, JSON.stringify(form)),
    setDomainRegistryLock: (uuid) => instance.post(`/api/domains/${uuid}/registry_lock`),
    deleteDomainRegistryLock: (uuid) => instance.delete(`/api/domains/${uuid}/registry_lock`),
};
