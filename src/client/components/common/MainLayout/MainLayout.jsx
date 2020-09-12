import React from 'react';
import { Icon } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import MainFooter from '../MainFooter/MainFooter';
import MainHeader from '../MainHeader/MainHeader';

const MainLayout = ({
    children,
    hasBackButton,
    heroKey,
    heroValues,
    htmlTitleKey,
    htmlTitleValues,
    title,
    titleValues,
    titleKey,
}) => {
    const { goBack } = useHistory();
    const { formatMessage } = useIntl();
    return (
        <React.Fragment>
            <Helmet
                title={
                    title ||
                    formatMessage(
                        { id: htmlTitleKey || titleKey },
                        {
                            ...htmlTitleValues,
                            ...titleValues,
                        }
                    ) + formatMessage({ id: 'head.title' })
                }
            />
            <MainHeader />
            <main className="main-layout">
                <div className="main-hero">
                    {title && <h1>{title}</h1>}
                    {titleKey && (
                        <FormattedMessage id={titleKey} tagName="h1" values={titleValues} />
                    )}
                    {heroKey && <FormattedMessage id={heroKey} tagName="p" values={heroValues} />}
                    {hasBackButton && (
                        <button className="back-link" onClick={goBack} type="button">
                            <Icon name="arrow left" />
                            <FormattedMessage id="hero.link.back" />
                        </button>
                    )}
                </div>
                {children}
            </main>
            <MainFooter />
        </React.Fragment>
    );
};

export default MainLayout;
