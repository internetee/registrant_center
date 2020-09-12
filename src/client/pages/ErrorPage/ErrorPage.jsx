import React from 'react';
import { FormattedMessage } from 'react-intl';
import { MainLayout, PageMessage } from '../../components';

class ErrorPage extends React.PureComponent {
    render() {
        const { ui, user } = this.props;
        return (
            <MainLayout hasBackButton titleKey="errorpage.title" ui={ui} user={user}>
                <PageMessage
                    headerContent={<FormattedMessage id="errorpage.none.message.title" />}
                    icon="times circle outline"
                >
                    <FormattedMessage id="errorpage.none.message.text" tagName="p" />
                </PageMessage>
            </MainLayout>
        );
    }
}

export default ErrorPage;
