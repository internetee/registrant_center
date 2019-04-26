import { createBrowserHistory } from 'history';
import DomainEditPage from './DomainEditPage';

const history = createBrowserHistory();


describe('pages/DomainEdit', () => {
  const mockAction = () => {};
  const mockMatch = {
    params: {
      id: 'domain.ee'
    }
  };
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
    setContacts: mockAction,
    match: mockMatch,
    history,
  };
  it('should render content', () => {
    const page = shallow(
      <DomainEditPage {...props} />
    );
    expect(page).toMatchSnapshot();
  });

});