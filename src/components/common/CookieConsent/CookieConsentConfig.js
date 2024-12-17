/**
 * @type {UserConfig}
 */
import GA from '../../../utils/googleAnalytics';
const pluginConfig = {
    // root: 'body',
    autoShow: true,
    // disablePageInteraction: true,
    // hideFromBots: true,
    // mode: 'opt-in',
    revision: 0,

    cookie: {
        name: 'cc_cookie',
        // domain: location.hostname,
        // path: '/',
        // sameSite: "Lax",
        // expiresAfterDays: 365,
    },

    // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
    guiOptions: {
        consentModal: {
            layout: 'cloud',
            position: 'bottom center',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    onChange: ({cookie, changedCategories, changedServices}) => {
        if (changedCategories.includes('analytics')) {
            const hasAnalyticsConsent = cookie.categories.includes('analytics');
            if (!hasAnalyticsConsent) {
                GA.init();
            }
        }
    },

    categories: {
        necessary: {
            enabled: true,  // this category is enabled by default
            readOnly: true  // this category cannot be disabled
        },
        analytics: {
            autoClear: {
                cookies: [
                    {
                        name: /^_ga/,   // regex: match all cookies starting with '_ga'
                    },
                    {
                        name: '_gid',   // string: exact cookie name
                    }
                ]
            },

            // // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
            // services: {
            //     ga: {
            //         label: 'Google Analytics',
            //         onAccept: () => {},
            //         onReject: () => {}
            //     },
            // }
        },
        ads: {}
    },

    language: {
        default: 'et',
        translations: {
            'en': {
                consentModal: {
                    title: 'We use cookies!',
                    description: 'Our website uses cookies to personalize content and ads, and to provide social media features. We ask for your permission to use cookies that are not necessarily essential for the basic functions of our website. Please read our detailed descriptions and rules of cookies <a class="cc__link" href="https://www.internet.ee/eif/cookies-on-internet-ee-webpage" target="_blank">here</a>.',
                    acceptAllBtn: 'Accept all',
                    showPreferencesBtn: 'Settings',
                    // closeIconLabel: 'Reject all and close modal',
                },
                preferencesModal: {
                    title: 'Cookie Settings',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save settings',
                    closeIconLabel: 'Close',
                    sections: [
                        {
                            title: 'Cookie usage',
                            description: 'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below. The cookies that are categorized as "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the site.',
                        },
                        {
                            title: 'Strictly necessary cookies',
                            description: 'Help us make the website more user-friendly by activating essential functions. The website cannot function properly without these cookies. As these cookies are needed for the secure provision of services, the visitor cannot refuse them.',

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Performance and Analytics cookies',
                            description: 'Help us understand how a specific visitor uses the website. This way we see how many people visit the site during a certain period, how they navigate through web pages, and what they click on. These cookies provide us with information based on which we improve the customer experience.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Name',
                                    domain: 'Domain',
                                    exp: 'Expiration',
                                    desc: 'Description'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: '.internet.ee',
                                        exp: '2 years',
                                        desc: 'Registers a unique ID that is used to generate statistical data on how the visitor uses the website.',
                                    },
                                    {
                                        name: '_gid',
                                        domain: '.internet.ee',
                                        exp: '1 day',
                                        desc: 'Registers a unique ID that is used to generate statistical data on how the visitor uses the website.',
                                    },
                                    {
                                        name: '_gat',
                                        domain: '.internet.ee',
                                        exp: '1 day',
                                        desc: 'Used by Google Analytics to throttle request rate.',
                                    }
                                ]
                            }
                        },
                    ]
                }
            },
            'et': {
                consentModal: {
                    title: 'Kasutame küpsiseid!',
                    description: 'Kasutame küpsiseid sisu ja reklaamide isikupärastamiseks ning sotsiaalse meedia funktsioonide pakkumiseks. Palume luba küpsiste kasutamiseks, mis ei ole tingimata vajalikud meie veebilehe põhifunktsioonide toimimiseks. Küpsiste üksikasjalikud kirjeldused ja reegleid leiad <a class="cc__link" href="https://www.internet.ee/eis/kupsised-internet-ee-lehel" target="_blank">siit</a>.',
                    acceptAllBtn: 'Luba kõik',
                    showPreferencesBtn: 'Seadistused',
                    // closeIconLabel: 'Reject all and close modal',
                },
                preferencesModal: {
                    title: 'Küpsiste seaded',
                    acceptAllBtn: 'Luba kõik',
                    acceptNecessaryBtn: 'Keela kõik',
                    savePreferencesBtn: 'Salvesta',
                    closeIconLabel: 'Sulge',
                    sections: [
                        {
                            title: 'Küpsiste kasutamine',
                            description: 'Kasutame küpsiseid, et aidata Teil tõhusalt navigeerida ja teatud funktsioone täita. Üksikasjalikku teavet kõigi küpsiste kohta leiate allpool iga nõusolekukategooria alt. Küpsistest, mis on liigitatud kui "Vajalikud", ei saa loobuda, sest need on olulised saidi põhifunktsioonide võimaldamiseks.',
                        },
                        {
                            title: 'Vajalikud küpsised',
                            description: 'Veebileht ei saa ilma nende küpsisteta korralikult toimida. Seetõttu ei ole külastajal võimalik neist keelduda.',

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Statistika ja analüütika küpsised',
                            description: 'Aitavad meil mõista, kuidas konkreetne külastaja veebilehte kasutab. Nii näeme, kui palju inimesi kindlal ajavahemikul lehte külastab, kuidas veebilehtedel liigutakse ja millele klikitakse. Need küpsised annavad meile infot, mille põhjal parendada kliendikogemust.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Nimi',
                                    domain: 'Domeen',
                                    exp: 'Kehtivus',
                                    desc: 'Kirjeldus'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: '.internet.ee',
                                        exp: '2 aastat',
                                        desc: 'Registreerib unikaalse ID, mida kasutatakse statistiliste andmete genereerimiseks selle kohta, kuidas külastaja veebisaiti kasutab.',
                                    },
                                    {
                                        name: '_gid',
                                        domain: '.internet.ee',
                                        exp: '1 päev',
                                        desc: 'Registreerib unikaalse ID, mida kasutatakse statistiliste andmete genereerimiseks selle kohta, kuidas külastaja veebisaiti kasutab.',
                                    },
                                    {
                                        name: '_gat',
                                        domain: '.internet.ee',
                                        exp: '1 päev',
                                        desc: 'Google Analytics kasutab seda taotluste määra piiramiseks.',
                                    }
                                ]
                            }
                        },
                    ]
                }
            }
        }
    }
};

export default pluginConfig;
