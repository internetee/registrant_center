import { createBrowserHistory } from 'history';
import ErrorPage from './ErrorPage';

const history = createBrowserHistory();

describe('pages/ErrorPage', () => {
  const props = {
    ui: {
      lang: 'et',
      menus: {
        main: mockMainMenu,
        footer: mockFooterMenu,
      }
    },
    user: mockUser.data,
    history,
  };
  it('should render error message', () => {
    const page = shallow(<ErrorPage {...props} />);
    expect(page).toMatchSnapshot();
  });

});