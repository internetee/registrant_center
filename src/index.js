import React from 'react';
import { render } from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createStateSyncMiddleware } from 'redux-state-sync';
import thunkMiddleware from 'redux-thunk';
import App from './App';
import * as serviceWorker from './serviceWorker';
import reducers from './redux/reducers';
import './utils/polyfills';
import 'eis-registrant-theme/dist/semantic.min.css';
import './index.scss';

const stateSyncConfig = {
    whitelist: ['LOGOUT_USER'],
};

const store = createStore(
    reducers,
    composeWithDevTools(
        applyMiddleware(thunkMiddleware, createStateSyncMiddleware(stateSyncConfig))
    )
);

render(
    <React.StrictMode>
        <Provider store={store}>
            <CookiesProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </CookiesProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
