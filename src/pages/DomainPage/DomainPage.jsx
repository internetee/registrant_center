/* eslint-disable camelcase */
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
// import PropTypes from 'prop-types';
import {
    Popup,
    Button,
    Form,
    Icon,
    Label,
    Container,
    Table,
    Modal,
    Checkbox,
    Confirm,
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    Loading,
    WhoIsEdit,
    MessageModule,
    PageMessage,
    MainLayout,
    WhoIsConfirmDialog,
} from '../../components';
import domainStatuses from '../../utils/domainStatuses.json';
import {
    fetchDomain as fetchDomainAction,
    lockDomain as lockDomainAction,
    unlockDomain as unlockDomainAction,
} from '../../redux/reducers/domains';
import { fetchCompanies as fetchCompaniesAction } from '../../redux/reducers/companies';
import { updateContact as updateContactAction } from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

const DomainPage = ({
    companies,
    contacts,
    domains,
    error,
    fetchCompanies,
    fetchDomain,
    isLoading,
    lockDomain,
    ui,
    unlockDomain,
    updateContact,
    user,
}) => {
    const { id } = useParams();
    const domain = domains[id];
    const { uiElemSize } = ui;

    const [isDirty, setIsDirty] = useState(false);
    const [isLockable, setIsLockable] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [isDomainLockModalOpen, setIsDomainLockModalOpen] = useState(false);
    const [userContacts, setUserContacts] = useState({});
    const [message, setMessage] = useState(null);
    const [extensionsProhibited, setExtensionsProhibited] = useState(false);
    const [registrantContacts, setRegistrantContacts] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!domain?.tech_contacts && !isLoading && !error) {
                await fetchDomain(id);
                if (companies.isLoading === null) {
                    fetchCompanies();
                }
            }
        };
        fetchData();
    }, [domain, fetchDomain, isLoading, id, error]);

    useEffect(() => {
        if (registrantContacts?.ident?.type === 'org') {
            if (companies.isLoading === null) {
                fetchCompanies();
            } else {
                setIsLockable(domain?.isLockable && companies.data[registrantContacts.ident.code]);
            }
        }
    }, [companies, domain, fetchCompanies, registrantContacts]);

    useEffect(() => {
        if (domain?.tech_contacts) {
            const userContact = Helpers.getUserContacts(user, domain, contacts, companies);
            if (Object.keys(userContact).length) {
                setUserContacts(userContact);
                const domain_contacts_keys = Object.keys(domain.contacts);
                const user_contacts_keys = Object.keys(userContact);
                let lockableFlag = false;

                for (let i = 0; i < user_contacts_keys.length; i += 1) {
                    for (let j = 0; j < domain_contacts_keys.length; j += 1) {
                        if (user_contacts_keys[i] === domain_contacts_keys[j]) {
                            if (
                                JSON.stringify(domain.contacts[domain_contacts_keys[j]].roles) ===
                                JSON.stringify(['tech'])
                            )
                                break;
                            lockableFlag = true;
                        }
                    }
                }

                setIsLockable(domain.isLockable && lockableFlag);
            }
            setRegistrantContacts({
                ...domain.registrant,
                ...contacts[domain.registrant.id],
            });
        }
    }, [companies, contacts, domain, user]);

    useEffect(() => {
        if (message) {
            window.scrollTo(0, 0);
        }
    }, [message]);

    const handleWhoIsChange = useCallback((data) => {
        setUserContacts((prevState) =>
            Object.entries(data).reduce(
                (acc, [id, { disclosed_attributes, registrant_publishable }]) => ({
                    ...acc,
                    [id]: {
                        ...prevState[id],
                        disclosed_attributes,
                        registrant_publishable,
                    },
                }),
                {}
            )
        );
        setIsDirty(true);
    }, []);

    const handleWhoIsSubmit = useCallback(async () => {
        setIsSaving(true);
        setIsSubmitConfirmModalOpen(false);
        await Promise.all(
            Object.values(userContacts || {}).map((contact) => {
                const form = {
                    disclosed_attributes: [...contact.disclosed_attributes],
                    registrant_publishable: contact.registrant_publishable,
                };
                return updateContact(contact.id, form);
            })
        );
        setIsDirty(false);
        setIsSaving(false);
        setMessage({
            code: 200,
            type: 'whois',
        });
    }, [userContacts, updateContact]);

    const toggleSubmitConfirmModal = useCallback(() => {
        setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
    }, [isSubmitConfirmModalOpen]);

    const toggleDomainLockModal = useCallback(() => {
        setIsDomainLockModalOpen(!isDomainLockModalOpen);
    }, [isDomainLockModalOpen]);

    const handleDomainLock = useCallback(
        async (uuid) => {
            setIsSaving(true);
            setIsDomainLockModalOpen(false);
            setMessage(null);

            const wasLocked = domain.isLocked;

            try {
                const result = wasLocked
                    ? await unlockDomain(uuid)
                    : await lockDomain(uuid, extensionsProhibited);

                // Check if the action resulted in an error
                if (result.payload.success === false) {
                    setMessage({
                        code: result.payload.code,
                        type: `domain${wasLocked ? 'Unlock' : 'Lock'}`,
                        success: false,
                        message: result.payload.message,
                    });
                } else {
                    setMessage({
                        code: 200,
                        type: `domain${wasLocked ? 'Unlock' : 'Lock'}`,
                        success: true,
                    });
                }
            } catch (error) {
                setMessage({
                    code: 500,
                    type: `domain${wasLocked ? 'Unlock' : 'Lock'}`,
                    success: false,
                    message: 'Unexpected error occurred',
                });
            }
            setIsSaving(false);
        },
        [domain, unlockDomain, lockDomain, extensionsProhibited]
    );

    const handleChangeExtensions = useCallback((mode) => {
        setExtensionsProhibited(mode);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    if (!domain || error) {
        return (
            <MainLayout hasBackButton titleKey="domain.404.title">
                <PageMessage
                    headerContent={
                        <FormattedMessage id="domain.404.message.title" tagName="span" />
                    }
                    icon="frown outline"
                >
                    <FormattedMessage id="domain.404.message.content" tagName="p" />
                </PageMessage>
            </MainLayout>
        );
    }

    return (
        <MainLayout hasBackButton title={domain.name}>
            {!isSaving && message && <MessageModule message={message} />}
            <div className="page page--domain">
                <div className="page--header">
                    <Container textAlign="center">
                        <div className="page--header--actions">
                            <Button
                                as={Link}
                                content={<FormattedMessage id="domain.changeContacts" />}
                                data-test="link-domain-edit"
                                primary
                                size={uiElemSize}
                                to={`/domain/${domain.id}/edit`}
                            />
                            {isLockable && (
                                <Button
                                    data-test={
                                        domain.isLocked ? 'open-unlock-modal' : 'open-lock-modal'
                                    }
                                    disabled={isSaving}
                                    loading={isSaving}
                                    onClick={toggleDomainLockModal}
                                    primary
                                    size={uiElemSize}
                                >
                                    {domain.isLocked ? (
                                        <FormattedMessage id="domain.unlock" />
                                    ) : (
                                        <FormattedMessage id="domain.lock" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.registrant" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.registrant.tooltip" />
                                </Popup>
                            </h2>
                        </header>
                        {registrantContacts && (
                            <Table basic="very">
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell width="4">
                                            <FormattedMessage
                                                id="domain.registrant.name"
                                                tagName="strong"
                                            />
                                        </Table.Cell>
                                        <Table.Cell>{`${registrantContacts.name} ${
                                            registrantContacts.code
                                                ? `(${registrantContacts.code})`
                                                : ''
                                        }`}</Table.Cell>
                                    </Table.Row>
                                    {registrantContacts.ident_type === 'priv' && (
                                        <Table.Row>
                                            <Table.Cell width="4">
                                                <FormattedMessage
                                                    id="domain.registrant.ident"
                                                    tagName="strong"
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {registrantContacts.ident.code ||
                                                    registrantContacts.ident}
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                    {(registrantContacts.ident.type === 'birthday' ||
                                        registrantContacts.ident_type === 'birthday') &&
                                        registrantContacts.ident && (
                                            <Table.Row>
                                                <Table.Cell width="4">
                                                    <FormattedMessage
                                                        id="domain.registrant.ident.birthday"
                                                        tagName="strong"
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>{registrantContacts.ident}</Table.Cell>
                                            </Table.Row>
                                        )}
                                    {registrantContacts.ident_type === 'org' &&
                                        registrantContacts.ident && (
                                            <Table.Row>
                                                <Table.Cell width="4">
                                                    <FormattedMessage
                                                        id="domain.registrant.ident.org"
                                                        tagName="strong"
                                                    />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {registrantContacts.ident.code ||
                                                        registrantContacts.ident}
                                                </Table.Cell>
                                            </Table.Row>
                                        )}
                                    {registrantContacts.email && (
                                        <Table.Row>
                                            <Table.Cell width="4">
                                                <FormattedMessage
                                                    id="domain.registrant.email"
                                                    tagName="strong"
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                <a href={`mailto:${registrantContacts.email}`}>
                                                    {registrantContacts.email}
                                                </a>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                    {registrantContacts.phone && (
                                        <Table.Row>
                                            <Table.Cell width="4">
                                                <FormattedMessage
                                                    id="domain.registrant.phone"
                                                    tagName="strong"
                                                />
                                            </Table.Cell>
                                            <Table.Cell>{registrantContacts.phone}</Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                        )}
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.contacts" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.contacts.tooltip" />
                                </Popup>
                            </h2>
                        </header>
                        <Table basic="very">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>
                                        <FormattedMessage
                                            id="domain.contact.type"
                                            tagName="strong"
                                        />
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <FormattedMessage
                                            id="domain.contact.name"
                                            tagName="strong"
                                        />
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <FormattedMessage
                                            id="domain.contact.email"
                                            tagName="strong"
                                        />
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <FormattedMessage
                                            id="domain.contact.phone"
                                            tagName="strong"
                                        />
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <DomainContacts
                                    contacts={domain.tech_contacts.map((item) => ({
                                        ...item,
                                        ...contacts[item.id],
                                    }))}
                                    type="tech"
                                />
                                <DomainContacts
                                    contacts={domain.admin_contacts.map((item) => ({
                                        ...item,
                                        ...contacts[item.id],
                                    }))}
                                    type="admin"
                                />
                            </Table.Body>
                        </Table>
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.statuses" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.statuses.tooltip" />
                                </Popup>
                            </h2>
                        </header>
                        <Table basic="very">
                            <Table.Body>
                                <DomainStatuses statuses={domain.statuses} />
                            </Table.Body>
                        </Table>
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.registrar" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.registrar.tooltip" />
                                </Popup>
                            </h2>
                        </header>
                        <Table basic="very">
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell width="4">
                                        <FormattedMessage
                                            id="domain.registrar.name"
                                            tagName="strong"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>{domain.registrar.name}</Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell width="4">
                                        <FormattedMessage
                                            id="domain.registrar.website"
                                            tagName="strong"
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {domain.registrar && domain.registrar.website ? (
                                            <a
                                                href={
                                                    domain.registrar.website.indexOf('http') > -1
                                                        ? domain.registrar.website
                                                        : `//${domain.registrar.website}`
                                                }
                                                rel="noopener noreferrer"
                                                target="_blank"
                                            >
                                                {domain.registrar.website}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                                {domain.transfer_code && (
                                    <Table.Row>
                                        <Table.Cell width="4">
                                            <FormattedMessage
                                                id="domain.transfer_code"
                                                tagName="strong"
                                            />
                                        </Table.Cell>
                                        <Table.Cell>{domain.transfer_code}</Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.nameservers" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.nameservers.tooltip" />
                                </Popup>
                            </h2>
                            {!domain.nameservers.length ? (
                                <FormattedMessage id="domain.nameservers.text" tagName="p" />
                            ) : null}
                        </header>
                        {domain.nameservers.length ? (
                            <Table basic="very">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>
                                            <FormattedMessage
                                                id="domain.hostname"
                                                tagName="strong"
                                            />
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>IPv4</Table.HeaderCell>
                                        <Table.HeaderCell>IPv6</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <DomainNameservers nameservers={domain.nameservers} />
                                </Table.Body>
                            </Table>
                        ) : null}
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.dnsSec.title" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.dnsSec.tooltip" />
                                </Popup>
                            </h2>
                            {!domain.dnssec_keys && !domain.dnssec_keys.length ? (
                                <FormattedMessage id="domain.dnsSec.noResults" tagName="p" />
                            ) : null}
                        </header>
                        {domain.dnssec_keys && domain.dnssec_keys.length ? (
                            <Table basic="very">
                                <Table.Body>
                                    {domain.dnssec_keys.map((item) => (
                                        <Table.Row key={item}>
                                            <Table.Cell>{item}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        ) : null}
                    </Container>
                </div>
                <div className="page--block">
                    <Container text>
                        <header className="page--block--header">
                            <h2>
                                <FormattedMessage id="domain.whoisPrivacy" />
                                <Popup basic inverted trigger={<Icon name="question circle" />}>
                                    <FormattedMessage id="domain.whoisPrivacy.tooltip" />
                                </Popup>
                            </h2>
                            <FormattedMessage id="domain.whoisPrivacy.text" tagName="p" />
                        </header>
                        <Form onSubmit={toggleSubmitConfirmModal}>
                            <WhoIsEdit
                                contacts={userContacts}
                                domain={domain}
                                domains={domains}
                                onChange={handleWhoIsChange}
                            />
                            <div className="form-actions">
                                <Button
                                    disabled={!isDirty}
                                    loading={isSaving}
                                    primary
                                    size={uiElemSize}
                                    type="submit"
                                >
                                    <FormattedMessage id="actions.save" tagName="span" />
                                </Button>
                            </div>
                        </Form>
                    </Container>
                </div>
            </div>

            <Confirm
                cancelButton={
                    <Button data-test="close-lock-modal" secondary size={uiElemSize}>
                        <FormattedMessage id="actions.confirm.no" tagName="span" />
                    </Button>
                }
                closeOnEscape
                confirmButton={
                    <Button data-test="lock-domain" primary size={uiElemSize}>
                        <FormattedMessage id="actions.confirm.yes" tagName="span" />
                    </Button>
                }
                content={
                    <Modal.Content className="center">
                        {domain.isLocked ? (
                            ''
                        ) : (
                            <div className="fs-18">
                                <Checkbox
                                    className="mr-1"
                                    name="name"
                                    onChange={(e, elem) => handleChangeExtensions(elem.checked)}
                                    value="some"
                                />
                                <FormattedMessage
                                    id="domain.lock.extenstionsProhibited.name"
                                    tagName="span"
                                />
                                <div>
                                    <FormattedMessage
                                        id="domain.lock.extenstionsProhibited.description"
                                        tagName="p"
                                    />
                                </div>
                                <div className="mb-1" />
                            </div>
                        )}
                        {domain.isLocked ? (
                            <FormattedMessage id="domain.unlock.description" tagName="p" />
                        ) : (
                            <FormattedMessage id="domain.lock.description" tagName="p" />
                        )}
                    </Modal.Content>
                }
                data-testid="lock-confirmation-modal"
                header={
                    <Modal.Header>
                        {domain.isLocked ? (
                            <FormattedMessage id="domain.unlock.title" tagName="h2" />
                        ) : (
                            <FormattedMessage id="domain.lock.title" tagName="h2" />
                        )}
                    </Modal.Header>
                }
                onCancel={toggleDomainLockModal}
                onConfirm={() => handleDomainLock(domain.id)}
                open={isDomainLockModalOpen}
                size="large"
            />
            <WhoIsConfirmDialog
                contacts={userContacts}
                onCancel={toggleSubmitConfirmModal}
                onConfirm={handleWhoIsSubmit}
                open={isSubmitConfirmModalOpen}
            />
        </MainLayout>
    );
};

const DomainNameservers = ({ nameservers }) => {
    return nameservers.map((item) => (
        <Table.Row key={item.ipv4}>
            <Table.Cell width="4">{item.hostname}</Table.Cell>
            <Table.Cell>{item.ipv4}</Table.Cell>
            <Table.Cell>{item.ipv6}</Table.Cell>
        </Table.Row>
    ));
};

const DomainStatuses = ({ statuses }) => {
    return statuses.map((status) => (
        <Table.Row key={status}>
            <Table.Cell width="4">
                <Label circular color={domainStatuses[status].color} empty />{' '}
                <FormattedMessage id={`domain.status.${status}`} tagName="strong" />
            </Table.Cell>
            <Table.Cell>
                <FormattedMessage id={`domain.status.${status}.description`} />
            </Table.Cell>
        </Table.Row>
    ));
};

const DomainContacts = ({ type, contacts }) => {
    return contacts.map((item) => (
        <Table.Row key={item.id}>
            <Table.Cell width="3">
                {type === 'admin' && (
                    <FormattedMessage id="domain.contact.admin" tagName="strong" />
                )}
                {type === 'tech' ? (
                    <FormattedMessage id="domain.contact.tech" tagName="strong" />
                ) : (
                    ''
                )}
            </Table.Cell>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>
                <a href={`mailto:${item.email}`}>{item.email}</a>
            </Table.Cell>
            <Table.Cell>{item.phone || '-'}</Table.Cell>
        </Table.Row>
    ));
};

const mapStateToProps = (state) => ({
    companies: state.companies,
    contacts: state.contacts.data,
    error: state.domains.error,
    domains: state.domains.data,
    isLoading: state.domains.isLoading,
    ui: state.ui,
    user: state.user.data,
});

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchCompanies: fetchCompaniesAction,
            fetchDomain: fetchDomainAction,
            lockDomain: lockDomainAction,
            unlockDomain: unlockDomainAction,
            updateContact: updateContactAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(DomainPage);

// DomainPage.propTypes = {
//     companies: PropTypes.object,
//     contacts: PropTypes.object,
//     domains: PropTypes.object,
//     fetchCompanies: PropTypes.func.isRequired,
//     fetchDomain: PropTypes.func.isRequired,
//     isLoading: PropTypes.bool.isRequired,
//     lockDomain: PropTypes.func.isRequired,
//     match: PropTypes.object.isRequired,
//     ui: PropTypes.object.isRequired,
//     unlockDomain: PropTypes.func.isRequired,
//     updateContact: PropTypes.func.isRequired,
//     user: PropTypes.object.isRequired,
// };

// DomainPage.defaultProps = {
//     companies: [],
//     contacts: [],
//     domains: [],
// };
