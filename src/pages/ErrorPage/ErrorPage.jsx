import React from 'react';
import { FormattedMessage } from 'react-intl';
import { MainLayout, PageMessage } from '../../components';

const ErrorPage = () => {
    return (
        <MainLayout hasBackButton titleKey="errorpage.title">
            <PageMessage
                headerContent={<FormattedMessage id="errorpage.none.message.title" />}
                icon="times circle outline"
            />
        </MainLayout>
    );
};

export default ErrorPage;
