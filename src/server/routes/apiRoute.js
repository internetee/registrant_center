import axios from 'axios';
import dotenv from 'dotenv';
import User from '../utils/UserSchema';

dotenv.config();

const { API_HOST, PUBLIC_API_HOST, PUBLIC_API_KEY } = process.env;

const isSessionValid = req => {
  return (
    !!req.session.token &&
    new Date(req.session.token.expires_at).getTime() > new Date().getTime()
  );
};

const publicAPI = axios.create({
  baseURL: PUBLIC_API_HOST,
  timeout: 10000,
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-API-TOKEN': PUBLIC_API_KEY
  }
});

const API = session => {
  return axios.create({
    baseURL: API_HOST,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(session.token && {
        Authorization: `Bearer ${session.token.access_token}`
      })
    },
    mode: 'cors',
    timeout: 10000
  });
};

const handleResponse = async (apiReq, res) => {
  try {
    const { data, status } = await apiReq();
    return res.status(status).json(data);
  } catch (e) {
    if (e.response) {
      return res.status(e.response.status).json({});
    }
    return res.status(408).json({});
  }
};

export default {
  checkAuth: (req, res, next) => {
    if (isSessionValid(req)) {
      return next();
    }
    return res.status(401).json({});
  },
  getMenu: async (req, res) => {
    const { type } = req.params;
    try {
      if (type === 'main') {
        const { data, status } = await publicAPI.get(
          '/admin/api/pages?q.page.hidden=false&per_page=250'
        );
        return res.status(status).json(data);
      }
      if (type === 'footer') {
        const texts = await publicAPI.get(
          '/admin/api/texts?q.content.name.$in=footer-links-1,footer-links-2,footer-links-3&parent_type=page'
        );
        const response = await Promise.all(
          texts.data.map(async text => {
            const textRes = await axios({
              method: 'GET',
              url: `${text.content.url}`,
              mode: 'cors',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-API-TOKEN': PUBLIC_API_KEY
              }
            });
            return textRes.data;
          })
        );
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

  getUser: async ({ session }, res) => {
    if (typeof session.user === 'undefined') {
      return res.status(400).json({
        error: 'Invalid user'
      });
    }
    try {
      const user = await User.findOne({ ident: session.user.ident });
      if (user) {
        if (!session.token) {
          const userData = session.user;
          const response = await API(session).post(
            '/api/v1/registrant/auth/eid',
            userData
          );
          // eslint-disable-next-line no-param-reassign
          session.token = response.data;
        }
        return res.status(200).json(user);
      }
      return res.status(404).json({
        error: 'User not found'
      });
    } catch (e) {
      if (e.response.status) {
        return res.status(e.response.status).json({});
      }
      return res.status(408).json({});
    }
  },

  destroyUser: async (req, res) => {
    req.session.regenerate(() => {
      res.end();
    });
  },

  getDomain: async ({ params, session }, res) => {
    const { uuid } = params;
    const { data, status } = await API(session).get(
      `/api/v1/registrant/domains/${uuid}`
    );
    return res.status(status).json(data);
  },

  getDomains: async ({ query, params, session }, res) => {
    const { uuid } = params;
    const { offset } = query;
    return handleResponse(
      () =>
        API(session, res).get(
          `/api/v1/registrant/domains${uuid ? `/${uuid}` : `?offset=${offset}`}`
        ),
      res
    );
  },

  getContacts: async ({ query, params, session }, res) => {
    const { uuid } = params;
    const { offset } = query;
    return handleResponse(
      () =>
        API(session, res).get(
          `/api/v1/registrant/contacts${
            uuid ? `/${uuid}` : `?offset=${offset}`
          }`
        ),
      res
    );
  },

  setContact: async ({ body, params, session }, res) => {
    const { uuid } = params;
    return handleResponse(
      () => API(session).patch(`/api/v1/registrant/contacts/${uuid}`, body),
      res
    );
  },

  setDomainRegistryLock: async ({ params, session }, res) => {
    const { uuid } = params;
    return handleResponse(
      () =>
        API(session).post(`/api/v1/registrant/domains/${uuid}/registry_lock`),
      res
    );
  },

  deleteDomainRegistryLock: async ({ params, session }, res) => {
    const { uuid } = params;
    return handleResponse(
      () =>
        API(session).delete(`/api/v1/registrant/domains/${uuid}/registry_lock`),
      res
    );
  }
};
