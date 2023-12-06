import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';
import Cookies from 'universal-cookie';

const { REACT_APP_GA_TRACKING_ID } = process.env;
class GoogleAnalytics extends Component {
    componentDidMount() {
        const {
            location: { pathname, search },
        } = this.props;
        this.logPageChange(pathname, search);
    }

    componentDidUpdate({ location: prevLocation }) {
        const {
            location: { pathname, search },
        } = this.props;
        const isDifferentPathname = pathname !== prevLocation.pathname;
        const isDifferentSearch = search !== prevLocation.search;

        if (isDifferentPathname || isDifferentSearch) {
            this.logPageChange(pathname, search);
        }
    }

    logPageChange(pathname, search = '') {
        const page = pathname + search;
        const { options } = this.props;
        ReactGA.set({
            location: `${window.location.origin}${page}`,
            page,
            ...options,
        });
        if (hasConsentForAnalytics()) {
            ReactGA.pageview(page);
        }
    }

    render() {
        return null;
    }
}

GoogleAnalytics.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string,
    }).isRequired,
};

const RouteTracker = () => <Route component={GoogleAnalytics} />;

const hasConsentForAnalytics = () => {
    try {
        const consentCookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('cc_cookie='));

        if (consentCookie) {
            const consentData = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
            return consentData.categories.includes('analytics');
        }

        return false;
    } catch (error) {
        console.error('Error parsing consent cookie:', error);
        return false;
    }
};

const removeGACookies = () => {
    const cookies = new Cookies().getAll(); // document.cookie.split(';');

    Object.keys(cookies).forEach((cookie) => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.match(/^(_ga|_gid|_gat|.+\._ga|.+\._gid|.+\._gat)$/)) {
            // document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            cookies.remove(cookieName);
        }
    });
};

const init = (options = {}) => {
    if (REACT_APP_GA_TRACKING_ID && hasConsentForAnalytics()) {
        ReactGA.initialize(REACT_APP_GA_TRACKING_ID);
        return true;
    }
    window[`ga-disable-${REACT_APP_GA_TRACKING_ID}`] = true;
    removeGACookies();
    return false;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    GoogleAnalytics,
    init,
    RouteTracker,
};
