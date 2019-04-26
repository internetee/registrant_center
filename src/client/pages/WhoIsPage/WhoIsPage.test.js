import { createBrowserHistory } from 'history';
import Cookies from 'universal-cookie';
import WhoIsPage from './WhoIsPage';

const history = createBrowserHistory();
const cookies = new Cookies();

const mockAction = () => {};
const props = {
  ui: {
    lang: 'et',
    uiElemSize: 'big',
    menus: {
      main: mockMainMenu,
      footer: mockFooterMenu,
    }
  },
  user: mockUser.data,
  initialDomains: mockDomains.data,
  initialContacts: mockContacts,
  history,
  cookies,
  setContacts: mockAction
};

describe('pages/WhoIs', () => {
  it('should render content', () => {
    const page = shallow(<WhoIsPage {...props} />);
    expect(page).toMatchSnapshot();
  });
  
});