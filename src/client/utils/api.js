import axios from 'axios';
import https from 'https';
import config from './clientConfig';

const agent = new https.Agent({
  rejectUnauthorized: false
});

const { HOST, PORT } = config;
const apiRequest = (url, method = 'GET', body) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const options = {
    method,
    url: `${HOST}:${PORT}${url}`,
    headers,
    data: body,
    httpsAgent: agent,
    validateStatus: (status) => {
      if (body) {
        return true;
      }
      return status >= 200 && status < 300;
    }
  };
  return axios(options);
};

export default {
  fetchMenu: (type) => {
    return axios({
      method: 'GET',
      url: `${HOST}:${PORT}/api/menu/${type}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
      credentials: 'include',
    });
  },
  fetchUser: () => {
    return axios({
      method: 'GET',
      url: `${HOST}:${PORT}/api/user`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
      credentials: 'include',
    });
  },

  destroyUser: () => {
    return axios({
      method: 'POST',
      url: `${HOST}:${PORT}/api/destroy`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
      credentials: 'include',
    });
  },

  fetchDomains: (uuid = false, offset) => {
    if (uuid) {
      return apiRequest(`/api/domains/${uuid}`);
    }
    return apiRequest(`/api/domains?offset=${offset}`);
  },
  
  fetchContacts: (uuid = false, offset) => {
    if (uuid) {
      return apiRequest(`/api/contacts/${uuid}`);
    }
    return apiRequest(`/api/contacts?offset=${offset}`);
  },
  
  setContacts: (uuid, form) => {
    return apiRequest(`/api/contacts/${uuid}`, 'PATCH', JSON.stringify(form));
  },
  
  setDomainRegistryLock: (uuid) => {
    return apiRequest(`/api/domains/${uuid}/registry_lock`, 'POST');
  },
  
  deleteDomainRegistryLock: (uuid) => {
    return apiRequest(`/api/domains/${uuid}/registry_lock`, 'DELETE');
  },

};
