import cheerio from 'cheerio';
import {Helmet} from 'react-helmet';
import renderPageRoute from './renderPageRoute';

describe('server/routes/renderPageRoute', () => {

  (function beforeAll() {
    Helmet.canUseDOM = false;
  })();

  it('should render login page', async () => {
    function getResponseAsDom(res){
      expect(res.send.mock.calls).toHaveLength(1);
      const renderedHTML = res.send.mock.calls[0][0];
      return cheerio.load(renderedHTML);
    }

    const mockReq = {
      url: '/login',
      session: {
        regenerate: jest.fn()
      },
    };
    const mockRes = {
      send: jest.fn(),
      sendFile: jest.fn(),
      redirect: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn(),
    };

    await renderPageRoute(mockReq, mockRes);

    const $ = getResponseAsDom(mockRes);
    expect($('#app')).toHaveLength(1);
  });
  
});