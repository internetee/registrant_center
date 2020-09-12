import { combineReducers } from 'redux';
import { withReduxStateSync } from 'redux-state-sync';
import ui from './ui';
import user from './user';
import domains from './domains';
import contacts from './contacts';

export default withReduxStateSync(
    combineReducers({
        contacts,
        domains,
        ui,
        user,
    })
);
