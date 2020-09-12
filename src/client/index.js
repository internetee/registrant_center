import React from 'react';
import { render } from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore, compose } from 'redux';
import { createStateSyncMiddleware } from 'redux-state-sync';
import thunkMiddleware from 'redux-thunk';
import reducers from './redux/reducers';
import './utils/polyfills';
import '../../semantic/dist/semantic.min.css';
import './index.scss';
import App from './App';

const stateSyncConfig = {
    whitelist: ['LOGOUT_USER'],
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(thunkMiddleware, createStateSyncMiddleware(stateSyncConfig)))
);

export default function Index() {
    return (
        <Provider store={store}>
            <CookiesProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </CookiesProvider>
        </Provider>
    );
}

render(<Index />, document.querySelector('#app'));
