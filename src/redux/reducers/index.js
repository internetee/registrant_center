import { combineReducers } from 'redux';
import { withReduxStateSync } from 'redux-state-sync';
import ui from './ui';
import user from './user';
import domains from './domains';
import companies from './companies';
import contacts from './contacts';
import verification from './verification';

export default withReduxStateSync(
    combineReducers({
        companies,
        contacts,
        domains,
        ui,
        user,
        verification
    })
);
