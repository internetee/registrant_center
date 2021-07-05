import { CookiesProvider } from 'react-cookie';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import translations from '../translations';
import state from './mockReduxState';

const lang = 'et';

export default function Providers({ children }) {
    return (
        <BrowserRouter>
            <Provider store={state}>
                <CookiesProvider>
                    <IntlProvider
                        key={lang}
                        defaultLocale="et"
                        locale={lang}
                        messages={translations[lang]}
                    >
                        {children}
                    </IntlProvider>
                </CookiesProvider>
            </Provider>
        </BrowserRouter>
    );
}
