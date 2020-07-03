import axios from 'axios';
import dotenv from 'dotenv';
import User from '../utils/UserSchema';

dotenv.config();

const { API_HOST, PUBLIC_API_HOST, PUBLIC_API_KEY } = process.env;

const isSessionValid = req => {
  return !!req.session.token && (new Date(req.session.token.expires_at).getTime() > new Date().getTime());
};


const apiRequest = (url, token, method = 'GET', body) => {

  if (!token) {
    console.log('Access token not found'); // eslint-disable-line no-console
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const options = {
    method,
    url,
    mode: 'cors',
    headers,
    data: body,
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
  getMenu: async (req, res) => {
    const { type } = req.params;
    try {
      if (type === 'main') {
        const response = await axios({
          method: 'GET',
          url: `${PUBLIC_API_HOST}/admin/api/pages?q.page.hidden=false&per_page=250&api_token=${PUBLIC_API_KEY}`,
          mode: 'cors',
          token: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        return res.status(200).json(response.data);
      }
      if (type === 'footer') {
        const texts = await axios({
          method: 'GET',
          url: `${PUBLIC_API_HOST}/admin/api/texts?api_token=${PUBLIC_API_KEY}&q.content.name.$in=footer-links-1,footer-links-2,footer-links-3&parent_type=page`,
          mode: 'cors',
          token: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        const response = await Promise.all(texts.data.map(async text => {
          const textRes = await axios({
            method: 'GET',
            url: `${text.content.url}?api_token=${PUBLIC_API_KEY}`,
            mode: 'cors',
            token: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          return textRes.data;
        }));
        return res.status(200).json(response);
      }
      return res.status(500).json({
        error: 'Menu not found'
      });
    } catch (error) {
      return res.status(404).json({
        error: 'Menu not found'
      });
    }
  },
  
  getUser: async (req, res) => {
    if (typeof req.session.user === 'undefined') {
      return res.status(400).json({
        error: 'Invalid user'
      });
    }

    const user = await User.findOne({ ident: req.session.user.ident });
    if(user) {
      if (!req.session.token) {
        const userData = req.session.user;
        const response = await axios({
          method: 'POST',
          url: `${API_HOST}/api/v1/registrant/auth/eid`,
          mode: 'cors',
          token: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          data: userData
        });
        req.session.token = response.data;
      }
      return res.status(200).json(user);
    }
    return res.status(404).json({
      error: 'User not found'
    });
  },

  destroyUser: async (req, res) => {
    req.session.regenerate(() => {
      res.end();
    });
  },

  getDomain: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { status, data } = await apiRequest(`${API_HOST}/api/v1/registrant/domains/${uuid}`, token);
      res.status(status).json(data);
    } else {
      res.status(498).json({});
    }
  },
  
  getDomains: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { offset } = req.query;
      let response;
      if (uuid) {
        response = await apiRequest(`${API_HOST}/api/v1/registrant/domains/${uuid}`, token);
      } else {
        response = await apiRequest(`${API_HOST}/api/v1/registrant/domains?offset=${offset}`, token);
      }
      res.status(response.status).json(response.data);
    } else {
      res.status(498).json({});
    }
  },
  
  getContacts: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { offset } = req.query;
      let response;
      if (uuid) {
        response = await apiRequest(`${API_HOST}/api/v1/registrant/contacts/${uuid}`, token);
      } else {
        response = await apiRequest(`${API_HOST}/api/v1/registrant/contacts?offset=${offset}`, token);
      }
      console.log(response);
      res.status(response.status).json(response.data);
    } else {
      res.status(498).json({});
    }
  },
  
  setContact: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { body } = req;
      const { status, data } = await apiRequest(`${API_HOST}/api/v1/registrant/contacts/${uuid}`, token, 'PATCH', JSON.stringify(body));
      res.status(status).json(data);
    } else {
      res.status(498).json({});
    }
  },
  
  setDomainRegistryLock: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { status, data } = await apiRequest(`${API_HOST}/api/v1/registrant/domains/${uuid}/registry_lock`, token, 'POST');
      res.status(status).json(data);
    } else {
      res.status(498).json({});
    }
  },
  
  deleteDomainRegistryLock: async (req, res) => {
    if (isSessionValid(req)) {
      const { uuid } = req.params;
      const token = req.session.token.access_token;
      const { status, data } = await apiRequest(`${API_HOST}/api/v1/registrant/domains/${uuid}/registry_lock`, token, 'DELETE');
      res.status(status).json(data);
    } else {
      res.status(498).json({});
    }
  },
  
};
