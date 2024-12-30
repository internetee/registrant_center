import { lazy, useEffect, useState, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router';
import { connect } from 'react-redux';
import { IntlProvider, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import translations from './translations';
import { Loading, ProtectedRoute, ScrollToTop } from './components';
import {
    fetchMenu as fetchMenuAction,
    getDeviceType as getDeviceTypeAction,
} from './redux/reducers/ui';
import {
    fetchUser as fetchUserAction,
    logoutUser as logoutUserAction,
} from './redux/reducers/user';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DomainPage = lazy(() => import('./pages/DomainPage/DomainPage'));
const DomainEditPage = lazy(() => import('./pages/DomainEditPage/DomainEditPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage/CompaniesPage'));
const WhoIsPage = lazy(() => import('./pages/WhoIsPage/WhoIsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage/ErrorPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage/ConfirmationPage'));

function App({ fetchMenu, fetchUser, getDeviceType, isLoggedOut, ui, user }) {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const { isMainMenuOpen, lang } = ui || {};
    const { name } = user;

    useEffect(() => {
        getDeviceType(window.innerWidth);
        window.addEventListener('resize', getDeviceType);
        return () => window.removeEventListener('resize', getDeviceType);
    }, [getDeviceType]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await fetchMenu('main');
            await fetchMenu('footer');
            setIsLoading(false);
        })();
    }, [fetchMenu]);

    useEffect(() => {
        (async () => {
            if (!name && !isLoggedOut) {
                fetchUser();
            }
        })();
    }, [fetchUser, isLoggedOut, location, name]);

    return (
        <HelmetProvider>
            <IntlProvider defaultLocale="et" key={lang} locale={lang} messages={translations[lang]}>
                <FormattedMessage id="app.title">
                    {(title) => (
                        <Helmet>
                            <meta content="IE=edge,chrome=1" httpEquiv="X-UA-Compatible" />
                            <meta
                                content="width=device-width, initial-scale=1, maximum-scale=2, user-scalable=yes"
                                name="viewport"
                            />
                            <meta content="yes" name="apple-mobile-web-app-capable" />
                            <meta content="yes" name="mobile-web-app-capable" />
                            <link
                                href="/apple-touch-icon.png"
                                rel="apple-touch-icon"
                                sizes="180x180"
                            />
                            <link
                                href="/favicon-32x32.png"
                                rel="icon"
                                sizes="32x32"
                                type="image/png"
                            />
                            <link
                                href="/favicon-16x16.png"
                                rel="icon"
                                sizes="16x16"
                                type="image/png"
                            />
                            <link href="/site.webmanifest" rel="manifest" />
                            <link color="#009de1" href="/safari-pinned-tab.svg" rel="mask-icon" />
                            <meta content="#ffffff" name="msapplication-TileColor" />
                            <meta content="/mstile-144x144.png" name="msapplication-TileImage" />
                            <meta content="#ffffff" name="theme-color" />
                            <title>{title}</title>
                        </Helmet>
                    )}
                </FormattedMessage>
                <div className={classNames({ 'app-wrapper': true, 'u-menu-open': isMainMenuOpen })}>
                    <ScrollToTop location={location}>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <Suspense fallback={<Loading />}>
                                <Routes>
                                    {/* Redirect route */}
                                    {name && location.pathname === '/login' && (
                                        <Route
                                            element={<Navigate replace to="/" />}
                                            path="/login"
                                        />
                                    )}
                                    {/* Protected routes */}
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <HomePage />
                                            </ProtectedRoute>
                                        }
                                        path="/"
                                    />
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <DomainPage />
                                            </ProtectedRoute>
                                        }
                                        path="/domain/:id"
                                    />
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <DomainEditPage />
                                            </ProtectedRoute>
                                        }
                                        path="/domain/:id/edit"
                                    />
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <CompaniesPage />
                                            </ProtectedRoute>
                                        }
                                        path="/companies"
                                    />
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <WhoIsPage />
                                            </ProtectedRoute>
                                        }
                                        path="/whois"
                                    />
                                    {/* Public routes */}
                                    <Route
                                        element={<ConfirmationPage />}
                                        path="/confirmation/:name/:type/:token"
                                    />
                                    <Route
                                        element={<ConfirmationPage />}
                                        path="/confirmation/:name/:type"
                                    />
                                    <Route
                                        element={<ConfirmationPage />}
                                        path="/confirmation/:name"
                                    />
                                    <Route element={<LoginPage />} path="/login" />
                                    <Route element={<ErrorPage />} path="/:lang" />
                                </Routes>
                            </Suspense>
                        )}
                    </ScrollToTop>
                </div>
            </IntlProvider>
        </HelmetProvider>
    );
}

const mapStateToProps = ({ ui, user }) => ({
    isLoggedOut: user.isLoggedOut,
    ui,
    user: user.data,
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchMenu: fetchMenuAction,
            fetchUser: fetchUserAction,
            getDeviceType: getDeviceTypeAction,
            logoutUser: logoutUserAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(App);
