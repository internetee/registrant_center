/* eslint-disable */
import axios from 'axios';

const instance = axios.create({
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 300,
});

// Response interceptor for error handling
// instance.interceptors.response.use(
//     response => response,
//     error => {
//         console.error('API Error:', error);
//         return Promise.reject(error);
//     }
// );

export default {
    fetchMenu: (type) => {
        return instance.get(`/api/menu/${type}`);
    },

    fetchUser: () => {
        return instance.get('/api/user', {
            timeout: 15000,
        });
    },

    destroyUser: () => {
        return instance.post('/api/destroy');
    },

    fetchVerification: (domain, token, type) => {
        return instance.get(`/api/confirms/${domain}/${type}/${token}`, {
            timeout: 4000,
        });
    },

    sendVerificationResponse: (name, token, action, type) => {
        return instance.post(`/api/confirms/${name}/${type}/${token}/${action}`, {
            timeout: 4000,
        });
    },

    fetchUpdateContacts: (uuid) => {
        return instance.get(`/api/contacts/${uuid}/do_need_update_contacts`, {
            timeout: 4000,
        });
    },

    updateContacts: (uuid) => {
        return instance.post(`/api/contacts/${uuid}/update_contacts`);
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

    updateContact: (uuid, form) => 
        instance.patch(`/api/contacts/${uuid}`, JSON.stringify(form)),

    setDomainRegistryLock: (uuid, extensionsProhibited) => 
        instance.post(`/api/domains/${uuid}/registry_lock?extensionsProhibited=${extensionsProhibited}`),

    deleteDomainRegistryLock: (uuid) => 
        instance.delete(`/api/domains/${uuid}/registry_lock`),
};
