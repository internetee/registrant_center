import { Icon } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
    const navigate = useNavigate();
    const { formatMessage } = useIntl();
    const goBack = () => {
        navigate(-1);
    };

    // Create title safely
    const getTitle = () => {
        if (title) return title;
        if (htmlTitleKey || titleKey) {
            return formatMessage(
                { id: htmlTitleKey || titleKey },
                {
                    ...htmlTitleValues,
                    ...titleValues,
                }
            );
        }
        return '';
    };

    return (
        <HelmetProvider>
            <Helmet title={getTitle() + formatMessage({ id: 'head.title' })} />
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
        </HelmetProvider>
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
