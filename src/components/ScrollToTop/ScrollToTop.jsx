import { useEffect } from 'react';
import PropTypes from 'prop-types';

const ScrollToTop = ({ children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return children;
};

export default ScrollToTop;

ScrollToTop.propTypes = {
    children: PropTypes.node.isRequired,
};
