import LoginPage from './LoginPage';

describe('pages/Login', () => {
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
  };

  it('should render content', () => {
    const page = shallow(<LoginPage {...props} />);
    expect(page).toMatchSnapshot();
  });

});