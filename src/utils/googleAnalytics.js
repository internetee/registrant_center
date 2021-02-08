import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

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
        ReactGA.pageview(page);
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

const init = (options = {}) => {
    if (REACT_APP_GA_TRACKING_ID) {
        ReactGA.initialize(REACT_APP_GA_TRACKING_ID);
        return true;
    }
    return false;
};

export default {
    GoogleAnalytics,
    init,
    RouteTracker,
};
