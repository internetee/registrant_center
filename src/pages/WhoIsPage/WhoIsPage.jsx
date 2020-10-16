/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
import Helpers from '../../utils/helpers';

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const WhoIsPage = ({
    fetchContacts,
    initialContacts,
    initialDomains,
    message,
    ui,
    updateContact,
    user,
}) => {
    const [cookies, setCookies] = useCookies(['whoIsPerPage']);
    const { whoIsPerPage } = cookies;
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [perPage, setPerPage] = useState(whoIsPerPage ? Number(whoIsPerPage) : 12);
    const [activePage, setActivePage] = useState(1);
    const [queryKeys, setQueryKeys] = useState('');
    const [contacts, setContacts] = useState({});
    const [domains, setDomains] = useState(Object.values(initialDomains));
    const { uiElemSize } = ui;

    const paginatedDomains = [];
    const copied = [...domains];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
        paginatedDomains.push(copied.splice(0, perPage));
    }

    useEffect(() => {
        (async () => {
            await fetchContacts();
            setIsLoading(false);
        })();
    }, [fetchContacts]);

    useEffect(() => {
        setContacts(initialContacts);
    }, [initialContacts]);

    const handleItemsPerPage = (event, { value }) => {
        setCookies('whoIsPerPage', value, { path: '/whois' });
        setActivePage(1);
        setPerPage(value);
    };

    const handleSearchChange = (event, { value }) => {
        setQueryKeys(value);
        setDomains(value ? domains : initialDomains);
    };

    const handleSearchReset = () => {
        setQueryKeys('');
        setActivePage(1);
        setContacts(initialContacts);
        setDomains(initialDomains);
    };

    const handleSearch = () => {
        if (queryKeys.length > 0) {
            const query = queryKeys.toString().toLowerCase();
            const results = Object.values(initialDomains).filter((domain) => {
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
            setDomains(results.length ? results : []);
        } else if (queryKeys.length === 0) {
            setDomains(Object.values(initialDomains));
        }
        setActivePage(1);
    };

    const handleWhoIsChange = (data) => {
        setContacts((prevState) =>
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
            Object.values(contacts)
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

    return (
        <MainLayout hasBackButton titleKey="whois.title">
            {!isLoading && message && <MessageModule message={message} />}
            <div className="page page--whois">
                {initialDomains.length ? (
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
                                                placeholder="Otsi domeeni"
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
                                </Form>
                            </Container>
                        </div>
                        {isLoading || !domains.length ? (
                            <>
                                {isLoading && <Loading />}
                                {!isLoading && !domains.length && (
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
                                                        contacts={Helpers.getUserContacts(
                                                            user,
                                                            domain,
                                                            contacts
                                                        )}
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
                            contacts={contacts}
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
        initialContacts: state.contacts.data,
        initialDomains: state.domains.data,
        ui: state.ui,
        user: state.user.data,
    };
};

export default connect(mapStateToProps, {
    ...contactsActions,
})(WhoIsPage);