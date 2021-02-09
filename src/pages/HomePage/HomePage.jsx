import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { DomainList, UserData, MainLayout, Loading } from '../../components';
import { fetchDomains as fetchDomainsAction } from '../../redux/reducers/domains';

const HomePage = ({ totalDomains, domains, fetchDomains, ui, user, absoluteCount }) => {
    const { lang } = ui;
    moment.locale(lang);
    const [isLoading, setIsLoading] = useState(true);
    const { formatMessage } = useIntl();
    const [isTech, setTech] = useState(false);
    
    useEffect(() => {
        if (isTech) {
            (async () => {
            await fetchDomains(0, true, true);
            setIsLoading(false);
            })();
        } 
        else {
            (async () => {
                await fetchDomains(0, true, false);
                setIsLoading(false);
            })();
        }
    }       
    , [fetchDomains, isTech]);

    const checked = (cond = false) => {
        setIsLoading(true);
        setTech(cond);
    };

    if (isLoading) return <Loading />;

    return (
        <MainLayout
            heroKey="dashboard.hero.text"
            htmlTitleKey="dashboard.htmlTitle"
            titleKey="dashboard.title"
            titleValues={{
                name: `${user.first_name} ${user.last_name} (${user.ident})`,
                span: (text) => <span>{text}</span>,
            }}
            ui={ui}
            user={user}
        >
            <div className="page page--dashboard">
                <div className="quicklinks">
                    <Grid textAlign="center">
                        <Grid.Row>
                            <Grid.Column computer={4} mobile={8} tablet={8} widescreen={3}>
                                <Link className="quicklinks--link" to="/companies">
                                    <Icon name="building" size="large" />
                                    <FormattedMessage id="quicklinks.companies.title" />
                                </Link>
                                <FormattedMessage id="quicklinks.companies.text" tagName="p" />
                            </Grid.Column>
                            <Grid.Column computer={4} mobile={8} tablet={8} widescreen={3}>
                                <Link className="quicklinks--link" to="/whois">
                                    <Icon name="user secret" size="large" />
                                    <FormattedMessage id="quicklinks.whois.title" />
                                </Link>
                                <FormattedMessage
                                    id="quicklinks.whois.content"
                                    tagName="p"
                                    values={{
                                        a: (linkText) => (
                                            <a
                                                href={formatMessage({
                                                    id: 'quicklinks.whois.content.link',
                                                })}
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {linkText}
                                            </a>
                                        ),
                                    }}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
                <DomainList 
                    checked={checked}
                    domainCount={totalDomains}
                    domains={domains}
                    domainTotal={absoluteCount}
                    isTech={isTech}
                    lang={lang}
                />
                <UserData isTech={isTech} lang={lang} />
            </div>
        </MainLayout>
    );
};

const mapStateToProps = ({ domains, ui, user }) => {
    return {
        absoluteCount: domains.data.total,
        domains: Object.values(domains.data.domains),
        totalDomains: domains.data.count,
        ui,
        user: user.data,
    };
};

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchDomains: fetchDomainsAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
