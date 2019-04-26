import cheerio from 'cheerio';
import {Helmet} from 'react-helmet';
import callbackPageRoute from './callbackPageRoute';

describe('server/routes/callbackPageRoute', () => {

  (function beforeAll() {
    // to stop Helmet error where it thinks server calls are made during browser render
    Helmet.canUseDOM = false;
  })();

  it('should render login page', async () => {
    // convert returned markup into a cheerio dom so we can easily inspect it
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

    await callbackPageRoute(mockReq, mockRes);

    const $ = getResponseAsDom(mockRes);
    expect($('#app')).toHaveLength(1);
  });
  
});