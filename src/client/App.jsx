import React, {lazy, PureComponent, Suspense} from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import {IntlProvider, addLocaleData, FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import localeEt from 'react-intl/locale-data/et';
import localeEn from 'react-intl/locale-data/en';
import localeRu from 'react-intl/locale-data/ru';
import messages from './utils/messages';
import { Helmet, Loading, ScrollToTop } from './components';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DomainPage = lazy(() => import('./pages/DomainPage/DomainPage'));
const DomainEditPage = lazy(() => import('./pages/DomainEditPage/DomainEditPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage/CompaniesPage'));
const WhoIsPage = lazy(() => import('./pages/WhoIsPage/WhoIsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage/ErrorPage'));

addLocaleData([...localeEt, ...localeEn, ...localeRu]);

class App extends PureComponent {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { ui, isLoading, location } = this.props;
    const { lang } = ui;
    const isMenuOpen = ui.mainMenu.isOpen;
    return (
      <IntlProvider key={lang} defaultLocale='et' locale={lang} messages={messages[lang]}>
        <div className={ classNames({ 'app-wrapper': true, 'u-menu-open': isMenuOpen }) }>
          <FormattedMessage
            id="app.page_title"
            defaultMessage='EIS Registreerijaportaal'
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
                    component={(props) => <HomePage {...this.props} {...props} />}
                  />
                  <Route
                    exact
                    path='/login'
                    render={(props) => <LoginPage {...this.props} {...props} />}
                  />
                  <Route
                    exact
                    path='/domain/:id'
                    render={(props) => <DomainPage {...this.props} {...props} />}
                  />
                  <Route
                    exact
                    path='/domain/:id/edit'
                    render={(props) => <DomainEditPage {...this.props} {...props} />}
                  />
                  <Route
                    exact
                    path='/companies'
                    render={(props) => <CompaniesPage {...this.props} {...props} />}
                  />
                  <Route
                    exact
                    path='/whois'
                    render={(props) => <WhoIsPage {...this.props} {...props} />}
                  />
                  <Route
                    path='*'
                    render={(props) => <ErrorPage {...this.props} {...props} />}
                  />
                </Switch>
              </Suspense>
            ) }
          </ScrollToTop>
        </div>
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ui: state.ui,
    user: state.user.data,
    location: state.router.location
  };
};

export default connect(
  mapStateToProps
)(App);