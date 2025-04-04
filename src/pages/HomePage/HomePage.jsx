import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { DomainList, UserData, MainLayout, Loading } from '../../components';
import { fetchDomains as fetchDomainsAction } from '../../redux/reducers/domains';
import { setSortByRoles as setSortByRolesAction } from '../../redux/reducers/filters';

const HomePage = ({
    totalDomains,
    domains,
    fetchDomains,
    ui,
    user,
    absoluteCount,
    isTech,
    isUpdateContact,
    setSortByRoles,
}) => {
    const { lang } = ui;
    moment.locale(lang);
    const [isLoading, setIsLoading] = useState(true);
    const { formatMessage } = useIntl();
    const dispatch = useDispatch();

    const [techParams, setTechParams] = useState(isTech);
    const [previousTechParams] = useState(isTech);

    const onSelectTech = (value) => {
        setIsLoading(true);
        setTechParams(value);
        dispatch(setSortByRoles(value));
    };

    useEffect(() => {
        if (domains.length === 0) {
            (async () => {
                await fetchDomains(0, false, isTech);
                setIsLoading(false);
            })();
        } else if (previousTechParams !== isTech) {
            (async () => {
                await fetchDomains(0, false, isTech);
                setIsLoading(false);
            })();
        } else {
            setIsLoading(false);
        }
    }, [fetchDomains, isTech, domains.length, previousTechParams]);

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
                    domainCount={totalDomains}
                    domainTotal={absoluteCount}
                    domains={domains}
                    isTech={isTech}
                    isUpdateContact={isUpdateContact}
                    lang={lang}
                    onSelectTech={onSelectTech}
                />
                <UserData isTech={techParams} lang={lang} />
            </div>
        </MainLayout>
    );
};

const mapStateToProps = ({ domains, ui, user, filters }) => {
    return {
        absoluteCount: domains.data.total,
        domains: Object.values(domains.data.domains),
        isTech: filters.isTech,
        totalDomains: domains.data.count,
        ui,
        user: user.data,
        isUpdateContact: false,
    };
};

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchDomains: fetchDomainsAction,
            setSortByRoles: setSortByRolesAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);

HomePage.propTypes = {
    absoluteCount: PropTypes.number,
    domains: PropTypes.array,
    totalDomains: PropTypes.number.isRequired,
    fetchDomains: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    isTech: PropTypes.any.isRequired,
    setSortByRoles: PropTypes.func.isRequired,
};

HomePage.defaultProps = {
    absoluteCount: 0,
    domains: [],
};
