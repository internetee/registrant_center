import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Container, Icon, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { MainLayout, MessageModule } from '../../components';

const { REACT_APP_SERVER_PORT, REACT_APP_URL } = process.env;

const authPath =
	process.env.NODE_ENV === 'development'
		? `${REACT_APP_URL}:${REACT_APP_SERVER_PORT}/connect/openid`
		: `${REACT_APP_URL}/connect/openid`;

function LoginPage({ user, ui }) {
	const message = {
		code: user.status > 0 ? user.status : null,
		type: 'logout',
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
						<Form action={authPath}>
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
