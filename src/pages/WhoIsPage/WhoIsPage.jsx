/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Button,
    Form,
    Icon,
    Container,
    Table,
    Input,
    Pagination,
    Dropdown,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { useCookies } from 'react-cookie';
import MediaQuery from 'react-responsive';
import {
    Loading,
    MainLayout,
    MessageModule,
    PageMessage,
    WhoIsConfirmDialog,
} from '../../components';
import Domain from './Domain';
import * as contactsActions from '../../redux/reducers/contacts';
import { fetchDomains as fetchDomainsAction } from '../../redux/reducers/domains';
import { fetchCompanies as fetchCompaniesAction } from '../../redux/reducers/companies';
import Helpers from '../../utils/helpers';

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const WhoIsPage = ({
    companies,
    contacts,
    domains,
    fetchCompanies,
    fetchContacts,
    fetchDomains,
    message,
    ui,
    updateContact,
    user,
}) => {
    const { formatMessage } = useIntl();
    const [cookies, setCookies] = useCookies(['whoIsPerPage']);
    const { whoIsPerPage } = cookies;
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [perPage, setPerPage] = useState(whoIsPerPage ? Number(whoIsPerPage) : 12);
    const [activePage, setActivePage] = useState(1);
    const [queryKeys, setQueryKeys] = useState('');
    const [whoIsData, setWhoIsData] = useState({});
    const [results, setResults] = useState(domains);
    const { uiElemSize } = ui;

    const paginatedDomains = [];
    const copied = [...results];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
        paginatedDomains.push(copied.splice(0, perPage));
    }

    const [isTech, setTech] = useState(false);
    useEffect(() => {
        if (isTech) {
            (async () => {
                await fetchDomains(0, true, true);
                // setIsLoading(false);
            })();
        } else {
            (async () => {
                await fetchDomains(0, true, false);
                // setIsLoading(false);
            })();
        }
    }, [fetchDomains, isTech]);

    const checked = (cond = false) => {
        // setIsLoading(true);
        setTech(cond);
    };

    useEffect(() => {
        (async () => {
            await fetchDomains(0, false);
            await fetchContacts();
            await fetchCompanies();
            setIsLoading(false);
        })();
    }, [fetchCompanies, fetchContacts, fetchDomains]);

    useEffect(() => {
        setWhoIsData(contacts);
    }, [contacts]);

    useEffect(() => {
        setResults(domains);
    }, [domains]);

    const handleItemsPerPage = (event, { value }) => {
        setCookies('whoIsPerPage', value, { path: '/whois' });
        setActivePage(1);
        setPerPage(value);
    };

    const handleSearchChange = (event, { value }) => {
        setQueryKeys(value);
        setResults(value ? results : domains);
    };

    const handleSearchReset = () => {
        setQueryKeys('');
        setActivePage(1);
        setWhoIsData(contacts);
        setResults(domains);
    };

    const handleSearch = () => {
        if (queryKeys.length > 0) {
            const query = queryKeys.toString().toLowerCase();
            const queryResults = domains.filter((domain) => {
                return (
                    domain.name.toLowerCase().includes(query) ||
                    domain.tech_contacts.some((item) => item.name.toLowerCase().includes(query)) ||
                    domain.admin_contacts.some((item) => item.name.toLowerCase().includes(query)) ||
                    domain.nameservers.some(
                        (item) =>
                            item.hostname.toLowerCase().includes(query) ||
                            item.ipv4.toString().toLowerCase().includes(query) ||
                            item.ipv6.toString().toLowerCase().includes(query)
                    )
                );
            });
            setResults(queryResults.length ? queryResults : []);
        } else if (queryKeys.length === 0) {
            setResults(domains);
        }
        setActivePage(1);
    };

    const handleWhoIsChange = (data) => {
        setWhoIsData((prevState) =>
            Object.entries(prevState).reduce((acc, [id, contact]) => {
                if (data[id]) {
                    return {
                        ...acc,
                        [id]: {
                            ...contact,
                            changed: true,
                            disclosed_attributes: data[id].disclosed_attributes,
                        },
                    };
                }
                return {
                    ...acc,
                    [id]: contact,
                };
            }, {})
        );
        setIsDirty(true);
    };

    const toggleSubmitConfirmModal = () => {
        setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
    };

    const handleWhoIsSubmit = async () => {
        setIsLoading(true);
        setIsSubmitConfirmModalOpen(false);
        await Promise.all(
            Object.values(whoIsData)
                .filter(({ changed }) => changed)
                .map((contact) => {
                    const form = {
                        disclosed_attributes: [...contact.disclosed_attributes],
                    };
                    return updateContact(contact.id, form);
                })
        );
        setIsDirty(false);
        setIsLoading(false);
    };

    if ((!domains?.length || domains[0]?.tech_contacts?.length) && isLoading) {
        return <Loading />;
    }


    const handleRole = (event, { name, value }) => {
        if (value === 'domains.roles.regAndAdmRoles' && isTech) {
            checked(false);
        }
        if (value === 'domains.roles.allRoles' && !isTech) {
            checked(true);
        }
    };

    const roleOptions = [
        {
            id: 'domains.roles.regAndAdmRoles',
            key: 'domains.roles.regAndAdmRoles',
            text: formatMessage({ id: 'domains.roles.regAndAdmRoles' }),
            value: 'domains.roles.regAndAdmRoles',
        },
        {
            id: 'domains.roles.allRoles',
            key: 'domains.roles.allRoles',
            text: formatMessage({ id: 'domains.roles.allRoles' }),
            value: 'domains.roles.allRoles',
        },
    ];


    return (
        <MainLayout hasBackButton titleKey="whois.title">
            {!isLoading && message && <MessageModule message={message} />}
            <div className="page page--whois">
                {domains?.length ? (
                    <>
                        <div className="page--header">
                            <Container>
                                <div className="page--header--text">
                                    <FormattedMessage id="whois.content.title" tagName="h2" />
                                    <FormattedMessage id="whois.content.text" tagName="p" />
                                </div>
                                <Form className="form-filter" onSubmit={handleSearch}>
                                    <div className="form-filter--search">
                                        <div className="form-filter--actions" />
                                        <div className="search-field">
                                            <Input
                                                className="icon"
                                                defaultValue={queryKeys}
                                                disabled={isLoading}
                                                name="queryKeys"
                                                onChange={handleSearchChange}
                                                placeholder={formatMessage({
                                                    id: 'whois.searchForADomain',
                                                })}
                                                size="massive"
                                                type="text"
                                            />
                                            <Button
                                                color="orange"
                                                icon="sync"
                                                onClick={handleSearchReset}
                                                type="reset"
                                            />
                                            <Button icon="arrow right" primary type="submit" />
                                        </div>
                                        <div className="form-filter--actions">
                                            <MediaQuery
                                                query="(min-width: 768px)"
                                                values={{ width: 1224 }}
                                            >
                                                <Button
                                                    disabled={isLoading || !isDirty}
                                                    form="whois-page-form"
                                                    loading={isLoading}
                                                    primary
                                                    size={uiElemSize}
                                                    type="submit"
                                                >
                                                    <FormattedMessage id="actions.save" />
                                                </Button>
                                            </MediaQuery>
                                        </div>
                                    </div>
                                    <div>
                                        <FormattedMessage
                                            id="domains.form.selectRole"
                                            tagName="label"
                                        />
                                        <Dropdown
                                            defaultValue={
                                                isTech ? roleOptions[1].value : roleOptions[0].value
                                            }
                                            fluid
                                            name="queryRole"
                                            onChange={handleRole}
                                            options={roleOptions}
                                            selection
                                        />
                                        </div>
                                </Form>
                            </Container>
                        </div>
                        {isLoading || !results.length ? (
                            <>
                                {isLoading && <Loading />}
                                {!isLoading && !results.length && (
                                    <PageMessage
                                        headerContent={
                                            <FormattedMessage
                                                id="whois.search.message.title"
                                                tagName="span"
                                            />
                                        }
                                    />
                                )}
                            </>
                        ) : (
                            <div className="page--content">
                                <Container>
                                    <Form id="whois-page-form" onSubmit={toggleSubmitConfirmModal}>
                                        <Table verticalAlign="top">
                                            <Table.Header>
                                                <MediaQuery
                                                    query="(min-width: 768px)"
                                                    values={{ width: 1224 }}
                                                >
                                                    <Table.Row>
                                                        <Table.HeaderCell>
                                                            <FormattedMessage id="whois.domain" />
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell>
                                                            <FormattedMessage id="whois.publicInfo" />
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell />
                                                    </Table.Row>
                                                </MediaQuery>
                                                <MediaQuery
                                                    query="(max-width: 767px)"
                                                    values={{ width: 1224 }}
                                                >
                                                    <Table.Row>
                                                        <Table.HeaderCell>
                                                            <Button
                                                                disabled={isLoading || !isDirty}
                                                                form="whois-page-form"
                                                                loading={isLoading}
                                                                primary
                                                                size={uiElemSize}
                                                                type="submit"
                                                            >
                                                                <FormattedMessage id="actions.save" />
                                                            </Button>
                                                        </Table.HeaderCell>
                                                    </Table.Row>
                                                </MediaQuery>
                                            </Table.Header>
                                            <Table.Footer>
                                                <Table.Row>
                                                    <Table.Cell colSpan={3} textAlign="right">
                                                        <Button
                                                            disabled={isLoading || !isDirty}
                                                            form="whois-page-form"
                                                            loading={isLoading}
                                                            primary
                                                            size={uiElemSize}
                                                            type="submit"
                                                        >
                                                            <FormattedMessage id="actions.save" />
                                                        </Button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            </Table.Footer>
                                            <Table.Body>
                                                {paginatedDomains[activePage - 1].map((domain) => (
                                                    <Domain
                                                        key={domain.id}
                                                        contacts={Helpers.parseDomainContacts(
                                                            user,
                                                            domain,
                                                            whoIsData,
                                                            companies
                                                        )}
                                                        domains={domains}
                                                        id={domain.id}
                                                        name={domain.name}
                                                        onChange={handleWhoIsChange}
                                                    />
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </Form>
                                </Container>
                                <div className="paginator">
                                    <Container>
                                        <Pagination
                                            activePage={activePage}
                                            firstItem={null}
                                            lastItem={null}
                                            nextItem={{
                                                content: (
                                                    <>
                                                        <FormattedMessage id="pagination.next" />
                                                        <Icon name="arrow right" />
                                                    </>
                                                ),
                                                disabled: activePage === paginatedDomains.length,
                                                icon: true,
                                            }}
                                            onPageChange={(e, page) => setActivePage(page)}
                                            prevItem={{
                                                content: (
                                                    <>
                                                        <Icon name="arrow left" />
                                                        <FormattedMessage id="pagination.previous" />
                                                    </>
                                                ),
                                                disabled: activePage === 1,
                                                icon: true,
                                            }}
                                            totalPages={paginatedDomains.length}
                                        />
                                        <Form>
                                            <Form.Field inline>
                                                <FormattedMessage
                                                    id="pagination.perPage"
                                                    tagName="label"
                                                />
                                                <Dropdown
                                                    onChange={handleItemsPerPage}
                                                    options={perPageOptions}
                                                    selection
                                                    value={perPage}
                                                />
                                            </Form.Field>
                                        </Form>
                                    </Container>
                                </div>
                            </div>
                        )}
                        <WhoIsConfirmDialog
                            contacts={whoIsData}
                            onCancel={toggleSubmitConfirmModal}
                            onConfirm={handleWhoIsSubmit}
                            open={isSubmitConfirmModalOpen}
                        />
                    </>
                ) : (
                    <PageMessage
                        headerContent={<FormattedMessage id="whois.none.message.title" />}
                        icon="frown outline"
                    />
                )}
            </div>
        </MainLayout>
    );
};

const mapStateToProps = (state) => {
    return {
        companies: state.companies.data,
        contacts: state.contacts.data,
        domains: state.domains.ids.map((id) => state.domains.data.domains[id]),
        ui: state.ui,
        user: state.user.data,
    };
};

export default connect(mapStateToProps, {
    ...contactsActions,
    fetchCompanies: fetchCompaniesAction,
    fetchDomains: fetchDomainsAction,
})(WhoIsPage);
