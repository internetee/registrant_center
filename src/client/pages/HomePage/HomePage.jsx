import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { DomainList, UserData, MainLayout } from '../../components';
import { fetchDomains as fetchDomainsAction } from '../../redux/reducers/domains';

const HomePage = ({ domains, fetchDomains, ui, user }) => {
    const { lang } = ui;
    moment.locale(lang);

    useEffect(() => {
        (async () => {
            await fetchDomains();
        })();
    }, [fetchDomains]);

    return (
        <MainLayout
            heroKey="dashboard.hero.text"
            heroValues={{
                lastVisit: moment(user.visited_at).format('D.MM.YYYY HH:mm'),
            }}
            htmlTitleKey="dashboard.htmlTitle"
            titleKey="dashboard.title"
            titleValues={{
                name: `${user.first_name} ${user.last_name}`,
                span: text => <span>{text}</span>,
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
                                        a: linkText => (
                                            <a
                                                href="https://www.internet.ee/domeenid/whois-teenuse-kasutajatingimused"
                                                rel="noreferrer"
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
                <DomainList domains={domains} lang={lang} />
                <UserData lang={lang} />
            </div>
        </MainLayout>
    );
};

const mapStateToProps = ({ domains, ui, user }) => ({
    domains: Object.values(domains.data),
    ui,
    user: user.data,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            fetchDomains: fetchDomainsAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps())(HomePage);
