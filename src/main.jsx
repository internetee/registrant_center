import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { configureStore } from '@reduxjs/toolkit';
import { createStateSyncMiddleware } from 'redux-state-sync';
import App from './App';
import reducers from './redux/reducers';
import GA from './utils/googleAnalytics';
import './utils/polyfills';
import 'eis-registrant-theme/dist/semantic.min.css';
import './index.scss';

const stateSyncConfig = {
  whitelist: ['LOGOUT_USER'],
};

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
          createStateSyncMiddleware(stateSyncConfig)
      )
});

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Provider store={store}>
      <CookiesProvider>
        <BrowserRouter 
          future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {GA.init() && <GA.RouteTracker />}
          <App />
        </BrowserRouter>
      </CookiesProvider>
    </Provider>
  </StrictMode>,
)
