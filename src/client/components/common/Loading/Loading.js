import React from 'react';
import { Container, Loader } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

const Loading = () => (
  <Container text textAlign="center" className="loading">
    <Loader size="massive" active />
    <FormattedMessage id="loading" tagName="h2" />
  </Container>
);

export default Loading;
