import React from 'react';
import { Container, Header, Icon, Segment } from 'semantic-ui-react';

function PageMessage({ children, headerContent, icon }) {
    return (
        <Segment basic className="page--message">
            <Container text textAlign="center">
                <Header as="h2" icon>
                    <Icon circular name={icon || 'exclamation'} />
                    <Header.Content as="span">{headerContent}</Header.Content>
                </Header>
                {children}
            </Container>
        </Segment>
    );
}
export default PageMessage;
