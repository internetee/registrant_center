import { combineReducers } from 'redux';
import { withReduxStateSync } from 'redux-state-sync';
import { connectRouter } from 'connected-react-router';
import ui from './ui';
import user from './user';
import domains from './domains';
import contacts from './contacts';

export default history =>
  withReduxStateSync(
    combineReducers({
      router: connectRouter(history),
      ui,
      user,
      domains,
      contacts
    })
  );
