import { Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import dompurify from 'dompurify';
import * as CookieConsent from "vanilla-cookieconsent";
import PropTypes from 'prop-types';

const sanitizer = dompurify.sanitize;

const MainFooter = ({ ui }) => {
    const { lang, menus: { footer = [] } = [] } = ui;
    const menu = footer.reduce((acc, item) => {
        if (item.language.code === lang) {
            const body = item.text.body.split('href="/').join('href="https://www.internet.ee/');
            return [
                ...acc,
                {
                    body,
                    id: item.id,
                },
            ];
        }
        return acc;
    }, []);
    return (
        <footer className="site-footer">
            <div className="footer-top">
                <a className="footer-logo" href="/et">
                    <img alt="Logo" src="/eis-logo-white.svg" />
                </a>
                <div className="footer-contacts">
                    <div className="address">
                        <FormattedMessage id="footer.eis" tagName="h3" />
                        <p>
                            <a href="https://goo.gl/maps/1FiwD8m5B8y" target="_self">
                                Paldiski mnt 80, 10617 Tallinn
                            </a>
                        </p>
                        <FormattedMessage id="footer.eis.registerCode" tagName="p" />
                    </div>
                    <ul className="quickinfo">
                        <li>
                            <Icon name="envelope" />
                            <a href="mailto:info@internet.ee">info@internet.ee</a>
                        </li>
                        <li>
                            <Icon name="phone" />
                            727 1000
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <nav className="menu-footer">
                    {menu.map((item) => (
                        <div
                            key={item.id}
                            className="column"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: sanitizer(item.body) }}
                        />
                    ))}
                </nav>
                <nav className="menu-social">
                    <FormattedMessage id="footer.socialMedia" tagName="h3" />
                    <ul>
                        <li>
                            <a href="https://www.facebook.com/EE-748656818569233/" title="Facebook">
                                <Icon name="facebook" />
                            </a>
                        </li>
                        <li>
                            <a href="https://twitter.com/Eesti_Internet" title="Twitter">
                                <Icon name="twitter" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.youtube.com/channel/UC7nTB6zIwZYPFarlbKuEPRA"
                                title="Youtube"
                            >
                                <Icon name="youtube square" />
                            </a>
                        </li>
                        <li>
                            <a href="https://internet.ee/index.rss" title="RSS">
                                <Icon name="rss square" />
                            </a>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <button
                                className="btn"
                                onClick={() => showCookieSettings()}
                                type="button"
                            >
                                <FormattedMessage id="footer.cookieSettings" />
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    );
};

const mapStateToProps = ({ ui }) => ({
    ui,
});

const showCookieSettings = () => {
    CookieConsent.showPreferences();
};

export default connect(mapStateToProps)(MainFooter);

MainFooter.propTypes = {
    ui: PropTypes.object.isRequired,
};
