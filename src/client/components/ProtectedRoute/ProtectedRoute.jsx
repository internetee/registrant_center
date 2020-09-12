import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUserIfNeeded as fetchUserIfNeededAction } from '../../redux/reducers/user';
import Loading from '../common/Loading/Loading';

const ProtectedRoute = ({
    component: Component,
    fetchUserIfNeeded,
    isLoading,
    isLoggedIn,
    ...rest
}) => {
    useEffect(() => {
        (async () => {
            if (!isLoading && !isLoggedIn) {
                await fetchUserIfNeeded();
            }
        })();
    }, [fetchUserIfNeeded]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Route {...rest}>
            <Component />
            {/* isLoggedIn ? <Component /> : <Redirect to='/login' /> */}
        </Route>
    );
};

const mapStateToProps = ({ user }) => ({
    isLoading: user.isLoading,
    isLoggedIn: !!Object.keys(user.data).length,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchUserIfNeeded: fetchUserIfNeededAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoute);
