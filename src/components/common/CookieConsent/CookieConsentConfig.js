/**
 * @type {UserConfig}
 */
import Cookies from 'universal-cookie';
import GA from '../../../utils/googleAnalytics';
const cookies = new Cookies();
const pluginConfig = {
    current_lang: cookies.get('locale') || 'et',
    autoclear_cookies: true,
    page_scripts: true,
    cookie_name: 'cc_cookie',
    revision: 0,

    // onFirstAction(user_preferences, cookie) {
    //     // callback triggered only once
    //     const analyticsEnabled = window.CC.allowedCategory('analytics');
    //     console.log(`analytics ${analyticsEnabled ? 'enabled' : 'disabled'}`);
    // },

    // onAccept(cookie) {
    //     // ...
    // },

    onChange(cookie, changed_categories) {
        if (changed_categories.includes('analytics')) {
            const hasAnalyticsConsent = cookie.categories.includes('analytics');
            if (!hasAnalyticsConsent) {
                GA.init();
            }
        }
    },

    gui_options: {
        consent_modal: {
            layout: 'cloud',
            position: 'bottom center',
            transition: 'slide',
            swap_buttons: false,
        },
        settings_modal: {
            layout: 'box',
            position: 'right',
            transition: 'slide',
        },
    },

    languages: {
        en: {
            consent_modal: {
                title: 'We use cookies!',
                description:
                    'Our website uses cookies to personalize content and ads, and to provide social media features. We ask for your permission to use cookies that are not necessarily essential for the basic functions of our website. Please read our detailed descriptions and rules of cookies <a class="cc__link" href="https://www.internet.ee/eif/cookies-on-internet-ee-webpage" target="_blank">here</a>.',
                primary_btn: {
                    text: 'Accept all',
                    role: 'accept_all', // 'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text: 'Settings',
                    role: 'settings', // 'settings' or 'accept_necessary'
                },
            },
            settings_modal: {
                title: 'Cookie Settings',
                save_settings_btn: 'Save settings',
                accept_all_btn: 'Accept all',
                reject_all_btn: 'Reject all',
                close_btn_label: 'Close',
                cookie_table_headers: [
                    { col1: 'Name' },
                    { col2: 'Domain' },
                    { col3: 'Expiration' },
                    { col4: 'Description' },
                ],
                blocks: [
                    {
                        title: 'Cookie usage',
                        description:
                            'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below. The cookies that are categorized as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site.',
                    },
                    {
                        title: 'Strictly necessary cookies',
                        description:
                            'Help us make the website more user-friendly by activating essential functions. The website cannot function properly without these cookies. As these cookies are needed for the secure provision of services, the visitor cannot refuse them.',
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
                        },
                    },
                    {
                        title: 'Performance and Analytics cookies',
                        description:
                            'Help us understand how a specific visitor uses the website. This way we see how many people visit the site during a certain period, how they navigate through web pages, and what they click on. These cookies provide us with information based on which we improve the customer experience.',
                        toggle: {
                            value: 'analytics', // your cookie category
                            enabled: true,
                            readonly: false,
                        },
                        cookie_table: [
                            // list of all expected cookies
                            {
                                col1: '^_ga', // match all cookies starting with "_ga"
                                col2: '.internet.ee',
                                col3: '2 years',
                                col4: 'Registers a unique ID that is used to generate statistical data on how the visitor uses the website.',
                                is_regex: true,
                            },
                            {
                                col1: '_gid',
                                col2: '.internet.ee',
                                col3: '1 day',
                                col4: 'Registers a unique ID that is used to generate statistical data on how the visitor uses the website.',
                            },
                            {
                                col1: '_gat',
                                col2: '.internet.ee',
                                col3: '1 day',
                                col4: 'Used by Google Analytics to throttle request rate.',
                            },
                        ],
                    },
                ],
            },
        },
        et: {
            consent_modal: {
                title: 'Kasutame küpsiseid!',
                description:
                    'Kasutame küpsiseid sisu ja reklaamide isikupärastamiseks ning sotsiaalse meedia funktsioonide pakkumiseks. Palume luba küpsiste kasutamiseks, mis ei ole tingimata vajalikud meie veebilehe põhifunktsioonide toimimiseks. Küpsiste üksikasjalikud kirjeldused ja reegleid leiad <a class="cc__link" href="https://www.internet.ee/eis/kupsised-internet-ee-lehel" target="_blank">siit</a>.',
                primary_btn: {
                    text: 'Luba kõik',
                    role: 'accept_all', // 'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text: 'Seadistused',
                    role: 'settings', // 'settings' or 'accept_necessary'
                },
            },
            settings_modal: {
                title: 'Küpsiste seaded',
                save_settings_btn: 'Salvesta',
                accept_all_btn: 'Luba kõik',
                reject_all_btn: 'Keela kõik',
                close_btn_label: 'Sulge',
                cookie_table_headers: [
                    { col1: 'Nimi' },
                    { col2: 'Domeen' },
                    { col3: 'Kehtivus' },
                    { col4: 'Kirjeldus' },
                ],
                blocks: [
                    {
                        title: 'Küpsiste kasutamine',
                        description:
                            'Kasutame küpsiseid, et aidata Teil tõhusalt navigeerida ja teatud funktsioone täita. Üksikasjalikku teavet kõigi küpsiste kohta leiate allpool iga nõusolekukategooria alt. Küpsistest, mis on liigitatud kui "Vajalikud", ei saa loobuda, sest need on olulised saidi põhifunktsioonide võimaldamiseks.',
                    },
                    {
                        title: 'Vajalikud küpsised',
                        description:
                            'Veebileht ei saa ilma nende küpsisteta korralikult toimida. Seetõttu ei ole külastajal võimalik neist keelduda.',
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true, // cookie categories with readonly=true are all treated as "necessary cookies"
                        },
                    },
                    {
                        title: 'Statistika ja analüütika küpsised',
                        description:
                            'Aitavad meil mõista, kuidas konkreetne külastaja veebilehte kasutab. Nii näeme, kui palju inimesi kindlal ajavahemikul lehte külastab, kuidas veebilehtedel liigutakse ja millele klikitakse. Need küpsised annavad meile infot, mille põhjal parendada kliendikogemust.',
                        toggle: {
                            value: 'analytics', // your cookie category
                            enabled: true,
                            readonly: false,
                        },
                        cookie_table: [
                            // list of all expected cookies
                            {
                                col1: '^_ga', // match all cookies starting with "_ga"
                                col2: '.internet.ee',
                                col3: '2 aastat',
                                col4: 'Registreerib unikaalse ID, mida kasutatakse statistiliste andmete genereerimiseks selle kohta, kuidas külastaja veebisaiti kasutab.',
                                is_regex: true,
                            },
                            {
                                col1: '_gid',
                                col2: '.internet.ee',
                                col3: '1 päev',
                                col4: 'Registreerib unikaalse ID, mida kasutatakse statistiliste andmete genereerimiseks selle kohta, kuidas külastaja veebisaiti kasutab.',
                            },
                            {
                                col1: '_gat',
                                col2: '.internet.ee',
                                col3: '1 päev',
                                col4: 'Google Analytics kasutab seda taotluste määra piiramiseks.',
                            },
                        ],
                    },
                ],
            },
        },
    },
};

export default pluginConfig;
