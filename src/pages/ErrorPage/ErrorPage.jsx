import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Navigate, useParams } from 'react-router';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { MainLayout, PageMessage } from '../../components';
import { setLang as setLangAction } from '../../redux/reducers/ui';

const langs = ['et', 'en'];

const ErrorPage = ({ setLang }) => {
    const { lang } = useParams();

    useEffect(() => {
        if (langs.includes(lang)) {
            setLang(lang);
        }
    }, [lang, setLang]);

    if (langs.includes(lang)) {
        return <Navigate to="/" replace />;
    }

    return (
        <MainLayout hasBackButton titleKey="errorpage.title">
            <PageMessage
                headerContent={<FormattedMessage id="errorpage.none.message.title" />}
                icon="times circle outline"
            />
        </MainLayout>
    );
};

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            setLang: setLangAction,
        },
        dispatch
    );

export default connect(null, mapDispatchToProps)(ErrorPage);

ErrorPage.propTypes = {
    setLang: PropTypes.func.isRequired,
};
