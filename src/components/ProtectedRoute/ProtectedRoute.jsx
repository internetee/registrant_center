import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ fetchUser, user, ...rest }) => {
    const { data } = user;
    const { name } = data;

    if (!name) {
        return <Redirect to="/login" />;
    }
    return <Route {...rest} />;
};

const mapStateToProps = ({ user }) => ({ user });

export default connect(mapStateToProps)(ProtectedRoute);

ProtectedRoute.propTypes = {
    fetchUser: PropTypes.string,
    user: PropTypes.object.isRequired,
};

ProtectedRoute.defaultProps = {
    fetchUser: '',
};
