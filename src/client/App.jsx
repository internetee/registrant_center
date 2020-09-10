import React, {lazy, useEffect, useState, Suspense} from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import {IntlProvider, FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import translations from './translations';
import { Helmet, Loading, ScrollToTop } from './components';
import { fetchMenu as fetchMenuAction, getDeviceType as getDeviceTypeAction } from './redux/reducers/ui';
import { fetchUserIfNeeded as fetchUserIfNeededAction, logoutUser as logoutUserAction } from './redux/reducers/user';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DomainPage = lazy(() => import('./pages/DomainPage/DomainPage'));
const DomainEditPage = lazy(() => import('./pages/DomainEditPage/DomainEditPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage/CompaniesPage'));
const WhoIsPage = lazy(() => import('./pages/WhoIsPage/WhoIsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage/ErrorPage'));

function App({ fetchMenu, fetchUserIfNeeded, getDeviceType, ui }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { isMenuOpen, lang } = ui;

  useEffect(() => {
    window.scrollTo(0, 0);
    getDeviceType(window.innerWidth);
    window.addEventListener('resize', getDeviceType);
    return () => window.removeEventListener('resize', getDeviceType);
  }, [getDeviceType, window]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchMenu('main');
      await fetchMenu('footer');
      if (location.pathname !== '/login') {
        await fetchUserIfNeeded();
      }
      setIsLoading(false);
    })();
  }, [fetchMenu, fetchUserIfNeeded, location]);
  return (
    <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={translations[lang]}>
      <div className={ classNames({ 'app-wrapper': true, 'u-menu-open': isMenuOpen }) }>
        <FormattedMessage
          id="app.title"
        >
          {title => (
            <Helmet>
              <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2, user-scalable=yes"/>
              <meta name="apple-mobile-web-app-capable" content="yes"/>
              <meta name="mobile-web-app-capable" content="yes"/>
              <link rel="apple-touch-icon" sizes="180x180" href="../static/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="../static/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="../static/favicon-16x16.png" />
              <link rel="manifest" href="../static/site.webmanifest" />
              <link rel="mask-icon" href="../static/safari-pinned-tab.svg" color="#009de1" />
              <meta name="msapplication-TileColor" content="#ffffff" />
              <meta name="msapplication-TileImage" content="../static/mstile-144x144.png" />
              <meta name="theme-color" content="#ffffff" />
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <ScrollToTop location={location}>
          { isLoading ? (
            <Loading/>
          ) : (
            <Suspense fallback={<Loading />}>
              <Switch location={location}>
                <Route
                  exact
                  path='/'
                  component={HomePage}
                />
                <Route
                  exact
                  path='/login'
                  render={(props) => <LoginPage {...props} {...props} />}
                />
                <Route
                  exact
                  path='/domain/:id'
                  render={(props) => <DomainPage {...props} {...props} />}
                />
                <Route
                  exact
                  path='/domain/:id/edit'
                  render={(props) => <DomainEditPage {...props} {...props} />}
                />
                <Route
                  exact
                  path='/companies'
                  render={(props) => <CompaniesPage {...props} {...props} />}
                />
                <Route
                  exact
                  path='/whois'
                  render={(props) => <WhoIsPage {...props} {...props} />}
                />
                <Route
                  path='*'
                  render={(props) => <ErrorPage {...props} {...props} />}
                />
              </Switch>
            </Suspense>
          ) }
        </ScrollToTop>
      </div>
    </IntlProvider>
  );
}

const mapStateToProps = ({ ui, user }) => ({
  ui,
  user: user.data,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchMenu: fetchMenuAction,
  getDeviceType: getDeviceTypeAction,
  fetchUserIfNeeded: fetchUserIfNeededAction,
  logoutUser: logoutUserAction
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
