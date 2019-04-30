import React from 'react';
import PropTypes from 'prop-types';
import { Container, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

export function Loading({ isLoadingUser, isLoadingDomains, isLoadingContacts }) {
  const Message = () => {
    if (isLoadingUser) {
      return (
        <FormattedMessage
          id='loading.user'
          defaultMessage='Laen andmeid...'
          tagName='h2'
        />
      );
    }
    if (isLoadingDomains) {
      return (
        <FormattedMessage
          id='loading.domains'
          defaultMessage='Laen domeene...'
          tagName='h2'
        />
      );
    }
    if (isLoadingContacts) {
      return (
        <FormattedMessage
          id='loading.contacts'
          defaultMessage='Laen kontakte...'
          tagName='h2'
        />
      );
    }
    return (
      <FormattedMessage
        id='loading.loading'
        defaultMessage='Laen...'
        tagName='h2'
      />
    );
  };
  return (
    <Container text textAlign='center' className='loading'>
      <Loader size='massive' active />
      <Message/>
    </Container>
  );
}

Loading.propTypes = {
  isLoadingUser: PropTypes.bool,
  isLoadingDomains: PropTypes.bool,
  isLoadingContacts: PropTypes.bool,
};

Loading.defaultProps = {
  isLoadingUser: false,
  isLoadingDomains: false,
  isLoadingContacts: false,
};

const mapStateToProps = (state) => {
  return {
    isLoadingUser: state.user.isLoading,
    isLoadingDomains: state.domains.isLoading,
    isLoadingContacts: state.contacts.isLoading,
  };
};

export default connect(mapStateToProps)(Loading);