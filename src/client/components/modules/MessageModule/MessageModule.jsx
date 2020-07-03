import React from 'react';
import PropTypes from 'prop-types';
import { Message, Container, Icon } from 'semantic-ui-react';
import staticMessages from '../../../utils/staticMessages.json';

/**
 * @return {null}
 */
function MessageModule({ message, lang, formMessage }) {
  if (message) {
    let text = staticMessages[lang][message.type][message.code];
    // Select message from global messages
    if (!text) {
      text = staticMessages[lang].global[message.code];
    }
    return (
      <Message icon={formMessage} positive={message.code >= 200 || message.code < 300} negative={message.code >= 400} className={ (!formMessage ? 'status-message' : '') }>
        { formMessage ? (
          <React.Fragment>
            <Icon name={(message.code >= 200 || message.code < 300) ? 'check circle' : 'exclamation triangle'} />
            <Message.Content>
              <Message.Header>{ text }</Message.Header>
            </Message.Content>
          </React.Fragment>
        ) : (
          <Container>
            <Message.Header>
              { text }
            </Message.Header>
          </Container>
        )}
      </Message>
    );
  }
  return null;
}

MessageModule.propTypes = {
  formMessage: PropTypes.bool,
};

MessageModule.defaultProps = {
  formMessage: false,
};

export default MessageModule;
