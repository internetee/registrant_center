import React, {Component} from 'react';
import { render } from 'react-dom';
import {ConnectedRouter, push, routerMiddleware} from 'connected-react-router';
import { CookiesProvider } from 'react-cookie';
import {Provider} from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import { createStateSyncMiddleware } from 'redux-state-sync';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import reducers from './redux/reducers';
import './utils/polyfills';
import '../../semantic/dist/semantic.min.css';
import './index.scss';
import {fetchMenu, getDeviceType} from './redux/reducers/ui';
import {fetchUserIfNeeded, logoutUser} from './redux/reducers/user';
import {fetchDomains} from './redux/reducers/domains';
import App from './App';


const history = createBrowserHistory();

const stateSyncConfig = {
  whitelist: ['LOGOUT_USER']
};

const logOutMiddleware = store => next => action => {
  if (action.type === 'LOGOUT_USER') {
    store.dispatch(push('/login'));
  }
  return next(action);
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers(history), composeEnhancers(
  applyMiddleware(
    thunkMiddleware,
    routerMiddleware(history),
    logOutMiddleware,
    createStateSyncMiddleware(stateSyncConfig)
  ),
));

export default class Index extends Component {
  
  state = {
    isLoading: true
  };
  
  componentDidMount() {
    this.setDeviceType();
    window.addEventListener('resize', this.setDeviceType);
    store.dispatch(async (dispatch, getState) => {
      try {
        await dispatch(fetchMenu('main'));
        await dispatch(fetchMenu('footer'));
      } catch (e) {
        return Promise.resolve();
      }
      if (getState().router.location.pathname !== '/login') {
        return dispatch(
          fetchUserIfNeeded()
        ).then(() => {
          if (getState().user.status === 200) {
            return Promise.resolve(dispatch(fetchDomains()));
          }
          return dispatch(logoutUser());
        }).catch(e =>
          console.log(e) // eslint-disable-line no-console
        );
      }
      return Promise.resolve();
    }
    ).then(() => {
      this.setState({ isLoading: false });
    });
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.setDeviceType);
  }
  
  setDeviceType = () => {
    store.dispatch(getDeviceType(window.innerWidth));
  };
  
  render() {
    const { isLoading } = this.state;
    return (
      <Provider store={store}>
        <CookiesProvider>
          <ConnectedRouter history={history}>
            <App isLoading={isLoading} />
          </ConnectedRouter>
        </CookiesProvider>
      </Provider>
    );
  }
}

render(<Index store={store}/>, document.querySelector('#app'));
