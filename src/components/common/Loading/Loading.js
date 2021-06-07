import React from 'react';
import { Container, Loader } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Loading = () => (
	<Container className="loading" text textAlign="center">
		<Loader active size="massive" />
		<FormattedMessage id="loading" tagName="h2" />
	</Container>
);

export default Loading;
