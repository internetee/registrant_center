import React from 'react';
import { Icon } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

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
        <>
            <Helmet
                title={
                    (title ||
                        formatMessage(
                            { id: htmlTitleKey || titleKey },
                            {
                                ...htmlTitleValues,
                                ...titleValues,
                            }
                        )) + formatMessage({ id: 'head.title' })
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
        </>
    );
};

export default MainLayout;

MainLayout.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    heroValues: PropTypes.string,
    hasBackButton: PropTypes.bool,
    htmlTitleValues: PropTypes.string,
    heroKey: PropTypes.string,
    htmlTitleKey: PropTypes.string,
    titleValues: PropTypes.object,
    titleKey: PropTypes.string,
};

MainLayout.defaultProps = {
    children: '',
    title: '',
    heroValues: '',
    hasBackButton: true,
    htmlTitleValues: '',
    heroKey: '',
    htmlTitleKey: '',
    titleValues: {},
    titleKey: '',
};
