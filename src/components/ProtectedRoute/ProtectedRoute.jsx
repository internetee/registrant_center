import { Navigate } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ user, children }) => {
    if (!user?.data?.name) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps)(ProtectedRoute);

ProtectedRoute.propTypes = {
    user: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};
