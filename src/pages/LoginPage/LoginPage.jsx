import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Container, Icon, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { MainLayout, MessageModule } from '../../components';

const { VITE_SERVER_PORT, VITE_URL } = import.meta.env;

const getAuthUrl = (lang) => {
    if (!VITE_URL || (process.env.NODE_ENV === 'development' && !VITE_SERVER_PORT)) {
        console.error('Missing required environment variables for auth URL');
        return null;
    }

    const baseUrl =
        process.env.NODE_ENV === 'development' ? `${VITE_URL}:${VITE_SERVER_PORT}` : VITE_URL;

    try {
        // Ensure URL is properly encoded
        return new URL(`/connect/openid/${encodeURIComponent(lang)}`, baseUrl).toString();
    } catch (error) {
        console.error('Failed to construct auth URL:', error);
        return null;
    }
};

function LoginPage({ user, ui }) {
    const message = {
        code: user.status > 0 ? user.status : null,
        type: 'logout',
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const authUrl = getAuthUrl(ui.lang);

        if (!authUrl) {
            // You might want to show an error message to the user here
            console.error('Unable to proceed with login - invalid auth URL');
            return;
        }

        window.location.href = authUrl;
    };

    return (
        <MainLayout heroKey="login.hero.text" titleKey="login.title">
            {user.isLoggedOut && message.code && <MessageModule message={message} />}
            <div className="page page--login">
                <div className="u-container">
                    <Container className="page--login--area" text textAlign="center">
                        <FormattedMessage id="login.content.title" tagName="h3" />
                        <FormattedMessage id="login.content.text" tagName="p" />
                        <div className="login-options">
                            <div className="login-options--item">
                                <Icon name="id card" size="big" />
                                <FormattedMessage id="login.options.idCard" tagName="p" />
                            </div>
                            <div className="login-options--item">
                                <Icon name="mobile alternate" size="big" />
                                <FormattedMessage id="login.options.mobileId" tagName="p" />
                            </div>
                            <div className="login-options--item">
                                <Icon name="lock" size="big" />
                                <FormattedMessage id="login.options.eidas" tagName="p" />
                            </div>
                            <div className="login-options--item">
                                <Icon name="mobile alternate" size="big" />
                                <FormattedMessage id="login.options.smartId" tagName="p" />
                            </div>
                        </div>
                        <Form onSubmit={handleLogin}>
                            <Button primary size={ui.uiElemSize} type="submit">
                                <FormattedMessage id="actions.login" tagName="span" />
                            </Button>
                        </Form>
                    </Container>
                </div>
            </div>
        </MainLayout>
    );
}

const mapStateToProps = ({ ui, user }) => ({
    ui,
    user,
});

export default connect(mapStateToProps)(LoginPage);

LoginPage.propTypes = {
    ui: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
};
