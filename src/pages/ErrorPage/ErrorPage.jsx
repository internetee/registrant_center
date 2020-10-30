import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { bindActionCreators } from 'redux';

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
        return <Redirect to="/" />;
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
