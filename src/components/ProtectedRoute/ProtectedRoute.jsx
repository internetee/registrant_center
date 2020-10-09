import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser as fetchUserAction } from '../../redux/reducers/user';
import Loading from '../common/Loading/Loading';

const ProtectedRoute = ({ fetchUser, user, ...rest }) => {
    const { name } = user;
    const [isLoading, setIsLoading] = useState(!name);

    useEffect(() => {
        (async () => {
            if (!name) {
                setIsLoading(true);
                await fetchUser();
            }
            setIsLoading(false);
        })();
    }, [fetchUser, name]);

    if (isLoading) {
        return <Loading />;
    }

    if (!name) {
        return <Redirect to="/login" />;
    }

    return <Route {...rest} />;
};

const mapStateToProps = ({ user }) => ({ user: user.data });

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchUser: fetchUserAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoute);
