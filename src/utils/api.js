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

    fetchDomains: (uuid = false, offset) => {
        if (uuid) {
            return instance.get(`/api/domains/${uuid}`);
        }
        return instance.get(`/api/domains?offset=${offset}`);
    },

    fetchCompanies: (offset) => {
        return instance.get(`/api/companies?offset=${offset}`);
    },

    fetchContacts: (uuid = false, offset) => {
        if (uuid) {
            return instance.get(`/api/contacts/${uuid}`);
        }
        return instance.get(`/api/contacts?offset=${offset}`);
    },
    updateContact: (uuid, form) => instance.patch(`/api/contacts/${uuid}`, JSON.stringify(form)),
    setDomainRegistryLock: (uuid) => instance.post(`/api/domains/${uuid}/registry_lock`),
    deleteDomainRegistryLock: (uuid) => instance.delete(`/api/domains/${uuid}/registry_lock`),
};
