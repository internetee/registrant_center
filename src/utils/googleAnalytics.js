import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

const { REACT_APP_GA_TRACKING_ID } = process.env;
const { props } = this.props;
class GoogleAnalytics extends Component {
    componentDidMount() {
        this.logPageChange(props.location.pathname, props.location.search);
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
        const { location } = this.window;
        ReactGA.set({
            location: `${location.origin}${page}`,
            page,
            ...props.options,
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
        console.log(REACT_APP_GA_TRACKING_ID);
        ReactGA.initialize(REACT_APP_GA_TRACKING_ID);
        return true;
    }
    console.log('FUCK');
    return false;
};

export default {
    GoogleAnalytics,
    init,
    RouteTracker,
};
