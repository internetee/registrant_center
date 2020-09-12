import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Message, Container, Icon } from 'semantic-ui-react';

function MessageModule({ message, formMessage }) {
    if (message) {
        return (
            <Message
                className={!formMessage ? 'status-message' : ''}
                icon={formMessage}
                negative={message.code >= 400}
                positive={message.code >= 200 || message.code < 300}
            >
                {formMessage ? (
                    <React.Fragment>
                        <Icon
                            name={
                                message.code >= 200 || message.code < 300
                                    ? 'check circle'
                                    : 'exclamation triangle'
                            }
                        />
                        <Message.Content>
                            <Message.Header>
                                <FormattedMessage id={`${message.type}.${message.code}`} />
                            </Message.Header>
                        </Message.Content>
                    </React.Fragment>
                ) : (
                    <Container>
                        <Message.Header>
                            <FormattedMessage id={`${message.type}.${message.code}`} />
                        </Message.Header>
                    </Container>
                )}
            </Message>
        );
    }
    return null;
}

export default MessageModule;
