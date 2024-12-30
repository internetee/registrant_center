import { useState, useEffect } from 'react';
import MediaQuery from 'react-responsive';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import MainMenu from '../MainMenu/MainMenu';
import logo from '../../../assets/logo.svg';

import {
    closeMainMenu as closeMainMenuAction,
    setLang as setLangAction,
    toggleMainMenu as toggleMainMenuAction,
} from '../../../redux/reducers/ui';
import { logoutUser as logoutUserAction } from '../../../redux/reducers/user';
import CookieConsentComponent from '../CookieConsent/CookieConsent';

function MainHeader({ closeMainMenu, logoutUser, setLang, toggleMainMenu, ui, user }) {
    // const { formatMessage } = useIntl();
    const {
        lang,
        menus: { main },
    } = ui;

    const [isHeaderFixed, setIsHeaderFixed] = useState(false);

    const handleScroll = (e) => {
        const { scrollTop } = e.target.scrollingElement;
        setIsHeaderFixed(scrollTop > 0);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logoutUser();
        closeMainMenu();
    };

    return (
        <>
            <header className={classNames({ 'main-header': true, 'u-fixed': isHeaderFixed })}>
                <MediaQuery query="(min-width: 1224px)">
                    <div className="main-header-top">
                        <PortalMenu items={main} lang={lang} />
                        <LangMenu handleLangSwitch={setLang} lang={lang} />
                        <UserMenu
                            handleLogout={handleLogout}
                            toggleMainMenu={toggleMainMenu}
                            user={user}
                        />
                    </div>
                </MediaQuery>
                <div className="main-header-bottom">
                    <Logo />
                    <MediaQuery query="(min-width: 1224px)">
                        <MainMenu
                            closeMainMenu={closeMainMenu}
                            items={main}
                            lang={lang}
                            user={user}
                        />
                    </MediaQuery>
                    <MediaQuery query="(max-width: 1223px)">
                        <div className="actions">
                            <button
                                className="btn btn-menu"
                                onClick={() => toggleMainMenu()}
                                type="button"
                            >
                                <Icon name="bars" />
                            </button>
                        </div>
                    </MediaQuery>
                </div>
            </header>
            <MediaQuery query="(max-width: 1223px)">
                <div className="menu-mobile">
                    <button className="btn btn-menu" onClick={() => toggleMainMenu()} type="button">
                        <Icon name="times" />
                    </button>
                    <LangMenu handleLangSwitch={setLang} lang={lang} />
                    <MainMenu closeMainMenu={closeMainMenu} items={main} lang={lang} user={user} />
                    <UserMenu
                        closeMainMenu={closeMainMenu}
                        handleLogout={handleLogout}
                        user={user}
                    />
                    <PortalMenu items={main} lang={lang} />
                </div>
            </MediaQuery>
            <CookieConsentComponent />
        </>
    );
}

const Logo = () => {
    return (
        <a className="logo" href="https://internet.ee">
            <img alt="Logo" src={logo} />
        </a>
    );
};

const PortalMenu = ({ items = [], lang }) => {
    const menu = items
        .filter((item) => {
            const includedItems = [2133844, 2223713, 2142515];
            return (
                !item.hidden && item.language.code === lang && includedItems.includes(item.node.id)
            );
        }, [])
        .sort((a, b) => {
            return a.node.position - b.node.position;
        });
    return (
        <nav className="menu-portal">
            <a href="https://internet.ee">
                <FormattedMessage id="header.public_portal" />
            </a>
            {menu.map((item) => (
                <a
                    className={
                        item.public_url === 'https://registrant.internet.ee'
                            ? 'u-active'
                            : undefined
                    }
                    href={item.public_url}
                    key={item.id}
                >
                    {item.title}
                </a>
            ))}
        </nav>
    );
};

const LangMenu = ({ lang, handleLangSwitch }) => {
    return (
        <nav className="menu-language">
            <ul>
                <li className={lang === 'et' ? 'active' : ''}>
                    <button onClick={() => handleLangSwitch('et')} type="button">
                        eesti keeles
                    </button>
                </li>
                <li className={lang === 'en' ? 'active' : ''}>
                    <button onClick={() => handleLangSwitch('en')} type="button">
                        in english
                    </button>
                </li>
            </ul>
        </nav>
    );
};

const UserMenu = ({ user, handleLogout }) => {
    if (user.ident) {
        return (
            <nav className="menu-user">
                {/*
        <Link to='/' onClick={() => closeMainMenu()}>
          <Icon name='user'/>
          { `${user.first_name} ${user.last_name}` }
        </Link>
        */}
                <button className="log-out" onClick={() => handleLogout()} type="button">
                    <FormattedMessage id="header.logOut" />
                </button>
            </nav>
        );
    }
    return null;
};

const mapStateToProps = ({ ui, user }) => ({
    ui,
    user: user.data,
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            closeMainMenu: closeMainMenuAction,
            logoutUser: logoutUserAction,
            setLang: setLangAction,
            toggleMainMenu: toggleMainMenuAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
MainHeader.propTypes = {
    closeMainMenu: PropTypes.func.isRequired,
    logoutUser: PropTypes.func.isRequired,
    setLang: PropTypes.func.isRequired,
    toggleMainMenu: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
};
