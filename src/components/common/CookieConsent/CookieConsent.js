import { useEffect } from 'react';
import pluginConfig from './CookieConsentConfig';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

function CookieConsentComponent() {
    useEffect(() => {
        try {
            CookieConsent.run(pluginConfig);
            CookieConsent.setLanguage(cookies.get('locale'));
        } catch (error) {
            console.error('Error initializing CookieConsent:', error);
        }
    }, []);

    return null;
}

export default CookieConsentComponent;
