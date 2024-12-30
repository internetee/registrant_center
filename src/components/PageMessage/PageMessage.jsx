import { Container, Header, Icon, Segment } from 'semantic-ui-react';
import PropTypes from 'prop-types';

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

PageMessage.propTypes = {
    children: PropTypes.node,
    headerContent: PropTypes.object.isRequired,
    icon: PropTypes.string,
};

PageMessage.defaultProps = {
    icon: '',
    children: '',
};
