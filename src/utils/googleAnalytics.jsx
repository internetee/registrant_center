/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router';
import Cookies from 'universal-cookie';

const { VITE_GA_TRACKING_ID } = import.meta.env;

function GoogleAnalytics({ options = {} }) {
    const location = useLocation();

    useEffect(() => {
        const logPageChange = (pathname, search = '') => {
            const page = pathname + search;
            ReactGA.set({
                location: `${window.location.origin}${page}`,
                page,
                ...options,
            });
            if (hasConsentForAnalytics()) {
                ReactGA.pageview(page);
            }
        };

        logPageChange(location.pathname, location.search);
    }, [location, options]);

    return null;
}

GoogleAnalytics.propTypes = {
    options: PropTypes.object,
};

const RouteTracker = () => <GoogleAnalytics />;

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
    const cookies = new Cookies(); // document.cookie.split(';');

    Object.keys(cookies.getAll()).forEach((cookie) => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.match(/^(_ga|_gid|_gat|.+\._ga|.+\._gid|.+\._gat)$/)) {
            // document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            cookies.remove(cookieName);
        }
    });
};

const init = () => {
    if (VITE_GA_TRACKING_ID && hasConsentForAnalytics()) {
        ReactGA.initialize(VITE_GA_TRACKING_ID);
        return true;
    }
    window[`ga-disable-${VITE_GA_TRACKING_ID}`] = true;
    removeGACookies();
    return false;
};

export default {
    GoogleAnalytics,
    init,
    RouteTracker,
};
