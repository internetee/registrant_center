import React from 'react';
import { Container, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

export function Loading({
  isLoadingUser,
  isLoadingDomains,
  isLoadingContacts
}) {
  const Message = () => {
    if (isLoadingUser) {
      return <FormattedMessage id="loading.user" tagName="h2" />;
    }
    if (isLoadingDomains) {
      return <FormattedMessage id="loading.domains" tagName="h2" />;
    }
    if (isLoadingContacts) {
      return <FormattedMessage id="loading.contacts" tagName="h2" />;
    }
    return <FormattedMessage id="loading.loading" tagName="h2" />;
  };
  return (
    <Container text textAlign="center" className="loading">
      <Loader size="massive" active />
      <Message />
    </Container>
  );
}

const mapStateToProps = ({ contacts, domains, user }) => {
  return {
    isLoadingContacts: contacts && contacts.isLoading,
    isLoadingDomains: domains && domains.isLoading,
    isLoading: user && user.isLoading
  };
};

export default connect(mapStateToProps)(Loading);
