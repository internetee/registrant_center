import React, { lazy, useEffect, useState, Suspense } from "react"
import { Switch, Route, useLocation, Redirect } from "react-router-dom"
import { connect } from "react-redux"
import { IntlProvider, FormattedMessage } from "react-intl"
import classNames from "classnames"
import { bindActionCreators } from "redux"
import translations from "./translations"
import { Helmet, Loading, ProtectedRoute, ScrollToTop } from "./components"
import {
    fetchMenu as fetchMenuAction,
    getDeviceType as getDeviceTypeAction,
} from "./redux/reducers/ui"
import {
    fetchUser as fetchUserAction,
    logoutUser as logoutUserAction,
} from "./redux/reducers/user"

const HomePage = lazy(() => import("./pages/HomePage/HomePage"))
const DomainPage = lazy(() => import("./pages/DomainPage/DomainPage"))
const DomainEditPage = lazy(() =>
    import("./pages/DomainEditPage/DomainEditPage")
)
const CompaniesPage = lazy(() => import("./pages/CompaniesPage/CompaniesPage"))
const WhoIsPage = lazy(() => import("./pages/WhoIsPage/WhoIsPage"))
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"))
const ErrorPage = lazy(() => import("./pages/ErrorPage/ErrorPage"))
const ConfirmationPage = lazy(() =>
    import("./pages/ConfirmationPage/ConfirmationPage")
)

function App({
    fetchMenu,
    fetchUser,
    getDeviceType,
    isLoggedOut,
    setLang,
    ui,
    user,
}) {
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(true)
    const { isMainMenuOpen, lang } = ui || {}
    const { name } = user

    useEffect(() => {
        getDeviceType(window.innerWidth)
        window.addEventListener("resize", getDeviceType)
        return () => window.removeEventListener("resize", getDeviceType)
    }, [getDeviceType])

    useEffect(() => {
        ;(async () => {
            setIsLoading(true)
            await fetchMenu("main")
            await fetchMenu("footer")
            setIsLoading(false)
        })()
    }, [fetchMenu])

    useEffect(() => {
        ;(async () => {
            if (!name && !isLoggedOut) {
                fetchUser()
            }
        })()
    }, [fetchUser, isLoggedOut, location, name])

    return (
        <IntlProvider
            key={lang}
            defaultLocale='et'
            locale={lang}
            messages={translations[lang]}
        >
            <FormattedMessage id='app.title'>
                {(title) => (
                    <Helmet>
                        <meta
                            content='IE=edge,chrome=1'
                            httpEquiv='X-UA-Compatible'
                        />
                        <meta
                            content='width=device-width, initial-scale=1, maximum-scale=2, user-scalable=yes'
                            name='viewport'
                        />
                        <meta
                            content='yes'
                            name='apple-mobile-web-app-capable'
                        />
                        <meta content='yes' name='mobile-web-app-capable' />
                        <link
                            href='./static/apple-touch-icon.png'
                            rel='apple-touch-icon'
                            sizes='180x180'
                        />
                        <link
                            href='/favicon-32x32.png'
                            rel='icon'
                            sizes='32x32'
                            type='image/png'
                        />
                        <link
                            href='/favicon-16x16.png'
                            rel='icon'
                            sizes='16x16'
                            type='image/png'
                        />
                        <link href='/site.webmanifest' rel='manifest' />
                        <link
                            color='#009de1'
                            href='./static/safari-pinned-tab.svg'
                            rel='mask-icon'
                        />
                        <meta
                            content='#ffffff'
                            name='msapplication-TileColor'
                        />
                        <meta
                            content='/mstile-144x144.png'
                            name='msapplication-TileImage'
                        />
                        <meta content='#ffffff' name='theme-color' />
                        <title>{title}</title>
                    </Helmet>
                )}
            </FormattedMessage>
            <div
                className={classNames({
                    "app-wrapper": true,
                    "u-menu-open": isMainMenuOpen,
                })}
            >
                <ScrollToTop location={location}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <Suspense fallback={<Loading />}>
                            <Switch location={location}>
                                {name && location.pathname === "/login" ? (
                                    <Redirect to='/' />
                                ) : null}
                                <ProtectedRoute
                                    component={HomePage}
                                    exact
                                    path='/'
                                />
                                <ProtectedRoute
                                    component={DomainPage}
                                    exact
                                    path='/domain/:id'
                                />
                                <ProtectedRoute
                                    component={DomainEditPage}
                                    exact
                                    path='/domain/:id/edit'
                                />
                                <ProtectedRoute
                                    component={CompaniesPage}
                                    exact
                                    path='/companies'
                                />
                                <ProtectedRoute
                                    component={WhoIsPage}
                                    exact
                                    path='/whois'
                                />
                                <Route
                                    component={ConfirmationPage}
                                    exact
                                    path='/confirmation/:name/:type/:token'
                                />
                                <Route
                                    component={LoginPage}
                                    exact
                                    path='/login'
                                />
                                <Route
                                    component={ErrorPage}
                                    exact
                                    path='/:lang'
                                />
                            </Switch>
                        </Suspense>
                    )}
                </ScrollToTop>
            </div>
        </IntlProvider>
    )
}

const mapStateToProps = ({ ui, user }) => ({
    isLoggedOut: user.isLoggedOut,
    ui,
    user: user.data,
})

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchMenu: fetchMenuAction,
            fetchUser: fetchUserAction,
            getDeviceType: getDeviceTypeAction,
            logoutUser: logoutUserAction,
        },
        dispatch
    )

export default connect(mapStateToProps, mapDispatchToProps)(App)
