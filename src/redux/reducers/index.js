import { combineReducers } from 'redux';
import { withReduxStateSync } from 'redux-state-sync';
import ui from './ui';
import user from './user';
import domains from './domains';
import companies from './companies';
import contacts from './contacts';
import verification from './verification';
import filters from './filters';
import accessEvents from './accessEvents';

export default withReduxStateSync(
    combineReducers({
        accessEvents,
        companies,
        contacts,
        domains,
        filters,
        ui,
        user,
        verification,
    })
);
