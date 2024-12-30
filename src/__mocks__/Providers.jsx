import { CookiesProvider } from 'react-cookie';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import translations from '../translations';
import PropTypes from 'prop-types';

const lang = 'et';

export default function Providers({ children, store }) {
    return (
        <BrowserRouter>
            <Provider store={store}>
                <CookiesProvider>
                    <IntlProvider
                        defaultLocale="et"
                        key={lang}
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

Providers.propTypes = {
    children: PropTypes.node.isRequired,
    store: PropTypes.object.isRequired,
};
