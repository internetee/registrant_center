import cheerio from 'cheerio';
import { Helmet } from 'react-helmet';
import renderPageRoute from './renderPageRoute';

describe('server/routes/renderPageRoute', () => {
    (function beforeAll() {
        Helmet.canUseDOM = false;
    })();

    it('should render login page', async () => {
        const mockReq = {
            session: {
                regenerate: jest.fn(),
            },
            url: '/login',
        };
        const mockRes = {
            redirect: jest.fn(),
            send: jest.fn(),
            sendFile: jest.fn(),
            setHeader: jest.fn(),
            status: jest.fn(),
        };

        function getResponseAsDom(res) {
            expect(res.send.mock.calls).toHaveLength(1);
            const renderedHTML = res.send.mock.calls[0][0];
            return cheerio.load(renderedHTML);
        }

        await renderPageRoute(mockReq, mockRes);

        const $ = getResponseAsDom(mockRes);
        expect($('#app')).toHaveLength(1);
    });
});
