/* eslint-disable */
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

    fetchUpdateContacts: (uuid) => {
        return instance.get(`/api/contacts/${uuid}/do_need_update_contacts`, {
            credentials: 'include',
            method: 'GET',
            timeout: 4000,
        });
    },

    updateContacts: (uuid) => {
        return axios.post(
            `/api/contacts/${uuid}/update_contacts`,
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

    fetchDomains: (uuid = false, offset = 0, simplify = true, tech = 'init') => {
        if (uuid) {
            return instance.get(`/api/domains/${uuid}`);
        }
        if (simplify) {
            return instance.get(`/api/domains?offset=${offset}&simple=true&tech=${tech}`);
        }
        if (!simplify) {
            return instance.get(`/api/domains?offset=${offset}&simple=false&tech=${tech}`);
        }

        return instance.get(`/api/domains?offset=init&tech=${tech}`);
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
    setDomainRegistryLock: (uuid, extensionsProhibited) => instance.post(`/api/domains/${uuid}/registry_lock?extensionsProhibited=${extensionsProhibited}`),
    deleteDomainRegistryLock: (uuid) => instance.delete(`/api/domains/${uuid}/registry_lock`),
};
