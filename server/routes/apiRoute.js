import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { API_HOST, PUBLIC_API_HOST, PUBLIC_API_KEY } = process.env;

const isSessionValid = (req) => {
    return (
        !!req.session.token &&
        new Date(req.session.token.expires_at).getTime() > new Date().getTime()
    );
};

const publicAPI = axios.create({
    baseURL: PUBLIC_API_HOST,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-API-TOKEN': PUBLIC_API_KEY,
    },
    method: 'GET',
    timeout: 10000,
});

const API = (session) => {
    return axios.create({
        baseURL: API_HOST,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(session.token && {
                Authorization: `Bearer ${session.token.access_token}`,
            }),
        },
        mode: 'cors',
        timeout: 15000,
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

    deleteDomainRegistryLock: async ({ params, session }, res) => {
        const { uuid } = params;
        return handleResponse(
            () => API(session).delete(`/api/v1/registrant/domains/${uuid}/registry_lock`),
            res
        );
    },

    destroyUser: async (req, res) => {
        req.session = null;
        res.end();
    },

    getCompanies: async ({ query, session }, res) => {
        const { offset } = query;
        return handleResponse(
            () => API(session, res).get(`/api/v1/registrant/companies?offset=${offset}`),
            res
        );
    },

    getContacts: async ({ query, params, session }, res) => {
        const { uuid } = params;
        const { offset, links } = query;
        if (links === 'true') {
            return handleResponse(
                () =>
                    API(session, res).get(
                        `/api/v1/registrant/contacts${
                            uuid ? `/${uuid}?links=true` : `?offset=${offset}`
                        }`
                    ),
                res
            );
        }
        return handleResponse(
            () =>
                API(session, res).get(
                    `/api/v1/registrant/contacts${uuid ? `/${uuid}` : `?offset=${offset}`}`
                ),
            res
        );
    },

    getDomain: async ({ params, session }, res) => {
        const { uuid } = params;
        const { data, status } = await API(session).get(`/api/v1/registrant/domains/${uuid}`);
        return res.status(status).json(data);
    },

    getDomains: async ({ query, params, session }, res) => {
        const { uuid } = params;
        const { offset, simple, tech } = query;
        if (simple === 'true') {
            if (tech === 'true') {
                return handleResponse(
                    () =>
                        API(session, res).get(
                            `/api/v1/registrant/domains${
                                uuid ? `/${uuid}` : `?offset=${offset}&simple=true&tech=true`
                            }`
                        ),
                    res
                );
            }
            return handleResponse(
                () =>
                    API(session, res).get(
                        `/api/v1/registrant/domains${
                            uuid ? `/${uuid}` : `?offset=${offset}&simple=true`
                        }`
                    ),
                res
            );
        }
        if (tech === 'true') {
            return handleResponse(
                () =>
                    API(session, res).get(
                        `/api/v1/registrant/domains${
                            uuid ? `/${uuid}` : `?offset=${offset}&simple=false&tech=true`
                        }`
                    ),
                res
            );
        }
        return handleResponse(
            () =>
                API(session, res).get(
                    `/api/v1/registrant/domains${uuid ? `/${uuid}` : `?offset=${offset}`}`
                ),
            res
        );
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
                    texts.data.map(async (text) => {
                        const textRes = await axios({
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'X-API-TOKEN': PUBLIC_API_KEY,
                            },
                            method: 'GET',
                            mode: 'cors',
                            url: `${text.content.url}`,
                        });
                        return textRes.data;
                    })
                );
                return res.status(200).json(response);
            }
            return res.status(500).json({
                error: 'Menu not found',
            });
        } catch (error) {
            return res.status(404).json({
                error: 'Menu not found',
            });
        }
    },

    getRegistrantUpdate: async (req, res, session) => {
        const name = req.params.name.toString();
        const token = req.params.token.toString();
        const type = req.params.type.toString();
        try {
            const response = await API(session).get(
                `/api/v1/registrant/confirms/${name}/${type}/${token}`,
                {}
            );
            return res.status(response.status).json(response.data);
        } catch (e) {
            if (e.response) {
                return res.status(e.response.status).json({});
            }
            return res.status(401).json({});
        }
    },

    getUser: async ({ session }, res) => {
        try {
            const userData = session.user;
            if (userData) {
                if (!session.token) {
                    const response = await API(session).post(
                        '/api/v1/registrant/auth/eid',
                        userData
                    );
                    // eslint-disable-next-line no-param-reassign
                    session.token = response.data;
                }
                return res.status(200).json(userData);
            }
            return res.status(498).json({});
        } catch (e) {
            if (e && e.response && e.response.status) {
                return res.status(e.response.status).json({});
            }
            return res.status(408).json({});
        }
    },

    sendVerificationStatus: async (req, res, session) => {
        const name = req.params.name.toString();
        const token = req.params.token.toString();
        const action = req.params.action.toString();
        const type = req.params.type.toString();
        try {
            const response = await API(session).post(
                `/api/v1/registrant/confirms/${name}/${type}/${token}/${action}`,
                {}
            );
            return res.status(response.status).json(response.data);
        } catch (e) {
            if (e.response) {
                return res.status(e.response.status).json({});
            }
            return res.status(401).json({});
        }
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
            () => API(session).post(`/api/v1/registrant/domains/${uuid}/registry_lock`),
            res
        );
    },
};
