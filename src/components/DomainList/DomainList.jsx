import { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Table,
    Button,
    Form,
    Input,
    Icon,
    Transition,
    Dropdown,
    Container,
    Pagination,
    Message,
} from 'semantic-ui-react';
import Masonry from 'react-layout-masonry';
import Flatpickr from 'react-flatpickr';
import { Estonian } from 'flatpickr/dist/l10n/et';
import 'flatpickr/dist/themes/light.css';
import classNames from 'classnames';
import { useCookies } from 'react-cookie';
import DomainGridItem from './GridItem';
import DomainListItem from './ListItem';
import PageMessage from '../PageMessage/PageMessage';
import domainStatuses from '../../utils/domainStatuses.json';
import { fetchUpdateContacts, updateContactsConfirm } from '../../redux/reducers/contacts';

const LIMIT_DOMAIN_TOTAL = 3000;

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const getLocale = (locale) => {
    if (locale === 'et') {
        return Estonian;
    }
    return {};
};

const DomainList = ({
    domainCount,
    domainTotal,
    domains,
    lang,
    onSelectTech,
    isTech,
    isUpdateContact,
    fetchUpdateContacts,
    updateContactsConfirm,
}) => {
    const { formatMessage } = useIntl();
    const [cookies, setCookies] = useCookies(['domainsIsGrid']);
    const { domainsIsGrid, domainsPerPage } = cookies;
    const [isGrid, setIsGrid] = useState(domainsIsGrid ? JSON.parse(domainsIsGrid) : true);
    const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
    const [roleDropboxValue, setRoleDropboxValue] = useState(isTech);

    const [form, setForm] = useState({
        queryKeys: '',
        queryRegistrant: 'all',
        queryRole: roleDropboxValue,
        queryStatus: 'all',
        queryValidToMax: null,
        queryValidToMin: null,
    });
    const { queryKeys, queryRegistrant, queryStatus, queryValidToMin, queryValidToMax } = form;
    const [minValidToDate, setMinValidToDate] = useState(null);
    const [maxValidToDate, setMaxValidToDate] = useState(null);
    const [filteredDomains, setFilteredDomains] = useState([]);
    const [registrantsOptions, setRegistrantsOptions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [perPage, setPerPage] = useState(domainsPerPage ? Number(domainsPerPage) : 24);
    const [domainsList, setDomainsList] = useState([]);
    const totalDomains = domainCount || 0;

    const masonry = useRef(null);

    useEffect(() => {
        if (isTech === 'init') {
            if (domainTotal < LIMIT_DOMAIN_TOTAL) {
                setRoleDropboxValue(true);
            } else {
                setRoleDropboxValue(false);
            }
        }

        if (domains.length) {
            const { registrants, allStatuses, maxDate, minDate, sortedDomains } = domains.reduce(
                (acc, domain) => ({
                    ...acc,
                    maxDate: domain.valid_to > acc.maxDate ? domain.valid_to : acc.maxDate,
                    minDate: domain.valid_to < acc.minDate ? domain.valid_to : acc.minDate,
                    registrants: {
                        ...acc.registrants,
                        [domain.registrant.ident]: {
                            key: domain.registrant.ident,
                            text: domain.registrant.name,
                            value: domain.registrant.ident,
                        },
                    },
                    sortedDomains: [
                        ...acc.sortedDomains,
                        {
                            ...domain,
                            statuses: domain.statuses.sort(
                                (a, b) => domainStatuses[a].priority - domainStatuses[b].priority
                            ),
                        },
                    ],
                    statuses: {
                        ...acc.statuses,
                        ...domain.statuses.reduce(
                            (statusesAcc, status) => ({
                                ...statusesAcc,
                                [status]: {
                                    key: status,
                                    label: {
                                        circular: true,
                                        color: domainStatuses[status]?.color || 'grey',
                                        empty: true,
                                    },
                                    text: formatMessage({ id: `domain.status.${status}` }),
                                    value: status,
                                },
                            }),
                            {}
                        ),
                    },
                }),
                {
                    allStatuses: {
                        all: {
                            key: 'all',
                            label: {
                                circular: true,
                                color: domainStatuses.all.color,
                                empty: true,
                            },
                            text: formatMessage({ id: 'domain.status.all' }),
                            value: 'all',
                        },
                    },
                    maxDate: domains[0].valid_to,
                    minDate: domains[0].valid_to,
                    registrants: {
                        all: {
                            key: 'all',
                            text: formatMessage({ id: 'domainsList.allRegistrants' }),
                            value: 'all',
                        },
                    },
                    sortedDomains: [],
                }
            );

            setStatuses(
                Object.values(allStatuses).sort(
                    (a, b) => domainStatuses[a].priority - domainStatuses[b].priority
                )
            );

            const reg_list = Object.values(registrants);
            reg_list.some(
                (i, idx) => i.value === 'all' && reg_list.unshift(reg_list.splice(idx, 1)[0])
            );

            setRegistrantsOptions(reg_list);
            setFilteredDomains(sortedDomains);
            setDomainsList(sortedDomains);
            setMinValidToDate(new Date(minDate));
            setMaxValidToDate(new Date(maxDate));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domains, formatMessage, lang]);

    // Set valid_to date range datepicker options
    const dateStartOptions = {
        dateFormat: 'd.m.Y',
        defaultDate: minValidToDate,
        locale: getLocale(lang),
        maxDate: maxValidToDate,
        minDate: minValidToDate,
    };

    const dateEndOptions = {
        dateFormat: 'd.m.Y',
        defaultDate: maxValidToDate,
        locale: getLocale(lang),
        maxDate: maxValidToDate,
        minDate: minValidToDate,
    };

    const paginatedDomains = [];
    const copied = [...filteredDomains];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
        paginatedDomains.push(copied.splice(0, perPage));
    }

    const toggleView = () => {
        setCookies('domainsIsGrid', !isGrid, { path: '/' });
        setActivePage(1);
        setIsGrid((prevState) => !prevState);
    };

    const toggleAdvSearch = () => {
        setIsAdvSearchOpen((prevState) => !prevState);
    };

    const setMinDate = (selectedDates) => {
        setForm((prevState) => ({
            ...prevState,
            queryValidToMin: new Date(selectedDates[0]).getTime(),
        }));
    };

    const setMaxDate = (selectedDates) => {
        setForm((prevState) => ({
            ...prevState,
            queryValidToMax: new Date(selectedDates[0]).setHours(23, 59, 59),
        }));
    };

    const handleItemsPerPage = (event, { value }) => {
        setCookies('domainsPerPage', value, { path: '/' });
        setActivePage(1);
        setPerPage(value);
    };

    const handleChange = (event, { name, value }) => {
        setForm((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        if (
            !queryKeys.length &&
            queryStatus === 'all' &&
            !queryValidToMin &&
            !queryValidToMax &&
            queryRegistrant === 'all'
        ) {
            setActivePage(1);
            setFilteredDomains(domainsList);
        } else {
            setActivePage(1);
            setFilteredDomains(
                domainsList
                    .filter((domain) => {
                        const query = queryKeys.toString().toLowerCase();
                        if (query.length) {
                            return domain.name.toLowerCase().includes(query);
                        }
                        return true;
                    })
                    .filter((domain) => {
                        if (queryStatus.length && queryStatus !== 'all') {
                            return domain.statuses.includes(queryStatus);
                        }
                        return true;
                    })
                    .filter((domain) => {
                        if (queryValidToMin && queryValidToMax) {
                            return (
                                new Date(domain.valid_to).getTime() >= queryValidToMin &&
                                new Date(domain.valid_to).getTime() <= queryValidToMax
                            );
                        }
                        if (queryValidToMin && !queryValidToMax) {
                            return new Date(domain.valid_to).getTime() >= queryValidToMin;
                        }
                        if (!queryValidToMin && queryValidToMax) {
                            return new Date(domain.valid_to).getTime() <= queryValidToMax;
                        }
                        return true;
                    })
                    .filter((domain) => {
                        if (queryRegistrant.length && queryRegistrant !== 'all') {
                            return domain.registrant.ident.includes(queryRegistrant);
                        }
                        return true;
                    })
            );
        }
    };

    const handleReset = () => {
        setForm({
            queryKeys: '',
            queryRegistrant: 'all',
            queryStatus: 'all',
            queryValidToMax: null,
            queryValidToMin: null,
        });
        setFilteredDomains(domainsList);
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

    const handleRole = (event, { _name, value }) => {
        if (value === 'domains.roles.regAndAdmRoles' && roleDropboxValue) {
            onSelectTech(false);
        }
        if (value === 'domains.roles.allRoles' && !roleDropboxValue) {
            onSelectTech(true);
        }
    };

    const [contactUpdate, setContactUpdate] = useState(isUpdateContact);
    const [contactUpdateCount, setContactUpdateCount] = useState('0');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetchUpdateContacts();
                if (response && response.payload) {
                    setContactUpdate(response.payload.update_contacts);
                    setContactUpdateCount(response.payload.counter);
                }
            } catch (error) {
                console.error('Error fetching update contacts:', error);
                // Optionally set some error state or show error message
            }
        };

        fetchContacts();
    }, [fetchUpdateContacts]);

    const updateContacts = async () => {
        setIsUpdating(true);
        try {
            const response = await updateContactsConfirm();
            if (response && response.payload) {
                setContactUpdate(!contactUpdate);
            }
        } catch (error) {
            console.error('Error updating contacts:', error);
            // Could add error message state here if needed
        } finally {
            setIsUpdating(false);
        }
    };

    const MessageUpdateContacts = () => (
        <Message negative>
            <FormattedMessage
                defaultMessage="Found mismatches in .ee registry between contact names and business/citizenship registries. Please confirm to update {count} contact records for your .ee domain registrations"
                id="domains.contacts.update.message"
                values={{
                    count: contactUpdateCount,
                }}
            />
            <p style={{ marginTop: '1em' }}>
                <Button
                    compact
                    disabled={isUpdating}
                    loading={isUpdating}
                    onClick={updateContacts}
                    primary
                >
                    <FormattedMessage
                        defaultMessage="Salvesta"
                        id="actions.update-contacts"
                        tagName="span"
                    />
                </Button>
            </p>
        </Message>
    );

    return (
        <div className="domains-list--wrap" data-testid="domains-list-wrap">
            <div className="page--header">
                <Container>
                    <div className="page--header--text">
                        <FormattedMessage
                            id="domains.title"
                            tagName="h2"
                            values={{
                                span: (text) => (
                                    <span>
                                        {text} of {domainTotal}
                                    </span>
                                ),
                                userTotalDomains: totalDomains,
                            }}
                        />
                        {contactUpdate ? <MessageUpdateContacts /> : <></>}
                    </div>
                    <Form className="form-filter" onSubmit={handleSubmit}>
                        <div className="form-filter--search">
                            <div className="form-filter--actions" />
                            <div className="search-field">
                                <Input
                                    className="icon"
                                    name="queryKeys"
                                    onChange={handleChange}
                                    placeholder={formatMessage({
                                        id: 'domains.searchForADomain',
                                    })}
                                    size="massive"
                                    type="text"
                                    value={queryKeys}
                                />
                                <Button
                                    color="orange"
                                    icon="sync"
                                    onClick={handleReset}
                                    type="reset"
                                />
                                <Button icon="arrow right" primary type="submit" />
                            </div>
                            <div className="form-filter--actions">
                                <Icon
                                    className={classNames('action--filter', {
                                        active: isAdvSearchOpen,
                                    })}
                                    link
                                    name="filter"
                                    onClick={toggleAdvSearch}
                                    size="big"
                                />
                                <MediaQuery query="(min-width: 768px)" values={{ width: 1224 }}>
                                    <Icon
                                        className={classNames('action--list', { active: !isGrid })}
                                        link
                                        name="th list"
                                        onClick={toggleView}
                                        size="big"
                                    />
                                    <Icon
                                        className={classNames('action--grid', { active: isGrid })}
                                        link
                                        name="th"
                                        onClick={toggleView}
                                        size="big"
                                    />
                                </MediaQuery>
                            </div>
                        </div>
                        <Transition animation="slide down" visible={isAdvSearchOpen}>
                            <div className="form-filter--adv-search">
                                <span
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        margin: '10px',
                                        textAlign: 'center',
                                    }}
                                />
                                <Form.Group>
                                    <Form.Field width="5">
                                        <FormattedMessage
                                            id="domains.form.selectRegistrant"
                                            tagName="label"
                                        />
                                        <Dropdown
                                            fluid
                                            name="queryRegistrant"
                                            onChange={handleChange}
                                            options={registrantsOptions}
                                            search
                                            selection
                                            value={queryRegistrant}
                                        />
                                    </Form.Field>
                                    <Form.Field width="5">
                                        <FormattedMessage
                                            id="domains.form.dateRange"
                                            tagName="label"
                                        />
                                        <Form.Group className="date-range">
                                            <div className="field">
                                                <div className="ui right icon input">
                                                    <Flatpickr
                                                        onClose={setMinDate}
                                                        options={dateStartOptions}
                                                    />
                                                    <Icon link name="calendar alternate" />
                                                </div>
                                            </div>
                                            <span className="date-range-sep">–</span>
                                            <div className="field">
                                                <div className="ui right icon input">
                                                    <Flatpickr
                                                        onClose={setMaxDate}
                                                        options={dateEndOptions}
                                                    />
                                                    <Icon link name="calendar alternate" />
                                                </div>
                                            </div>
                                        </Form.Group>
                                    </Form.Field>
                                    <Form.Field width="6">
                                        <FormattedMessage
                                            id="domains.form.selectStatus"
                                            tagName="label"
                                        />
                                        <Dropdown
                                            fluid
                                            name="queryStatus"
                                            onChange={handleChange}
                                            options={statuses}
                                            selection
                                            value={queryStatus}
                                        />
                                    </Form.Field>
                                    <Form.Field width="4">
                                        <FormattedMessage
                                            id="domains.form.selectRole"
                                            tagName="label"
                                        />
                                        <Dropdown
                                            defaultValue={
                                                roleDropboxValue
                                                    ? roleOptions[1].value
                                                    : roleOptions[0].value
                                            }
                                            fluid
                                            name="queryRole"
                                            onChange={handleRole}
                                            options={roleOptions}
                                            selection
                                        />
                                    </Form.Field>
                                    <div className="form-actions">
                                        <Button primary>
                                            <FormattedMessage
                                                id="domains.form.filter"
                                                tagName="span"
                                            />
                                        </Button>
                                    </div>
                                </Form.Group>
                            </div>
                        </Transition>
                    </Form>
                </Container>
            </div>
            {domains.length ? (
                <>
                    {paginatedDomains.length ? (
                        <>
                            <Transition animation="fade" duration={300} visible={isGrid}>
                                <div className="domains-grid--wrap">
                                    <Masonry
                                        className="domains-grid"
                                        columnProps={{
                                            className: 'domains-grid--item',
                                        }}
                                        columns={{ 640: 1, 768: 2 }}
                                        gap={16}
                                        ref={masonry}
                                    >
                                        {paginatedDomains[activePage - 1].map((domain) => (
                                            <DomainGridItem
                                                domain={domain}
                                                key={domain.id}
                                                lang={lang}
                                            />
                                        ))}
                                    </Masonry>
                                </div>
                            </Transition>
                            <Transition animation="fade" duration={300} visible={!isGrid}>
                                <div>
                                    <div className="domains-list">
                                        <Table celled unstackable verticalAlign="top">
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.domainName"
                                                            tagName="span"
                                                        />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.registrar"
                                                            tagName="span"
                                                        />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.status"
                                                            tagName="span"
                                                        />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.validUntil"
                                                            tagName="span"
                                                        />
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {paginatedDomains[activePage - 1].map((domain) => (
                                                    <DomainListItem
                                                        domain={domain}
                                                        key={domain.id}
                                                        lang={lang}
                                                    />
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </div>
                            </Transition>
                            <div className="paginator">
                                <Container>
                                    <Pagination
                                        activePage={activePage}
                                        firstItem={null}
                                        lastItem={null}
                                        nextItem={{
                                            content: (
                                                <>
                                                    <FormattedMessage
                                                        id="pagination.next"
                                                        tagName="span"
                                                    />
                                                    <Icon name="arrow right" />
                                                </>
                                            ),
                                            disabled: activePage === paginatedDomains.length,
                                            icon: true,
                                        }}
                                        onPageChange={(e, { activePage: page }) =>
                                            setActivePage(page)
                                        }
                                        prevItem={{
                                            content: (
                                                <>
                                                    <Icon name="arrow left" />
                                                    <FormattedMessage
                                                        id="pagination.previous"
                                                        tagName="span"
                                                    />
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
                        </>
                    ) : (
                        <PageMessage
                            headerContent={<FormattedMessage id="domains.search.message.title" />}
                        />
                    )}
                </>
            ) : (
                <PageMessage
                    headerContent={
                        <FormattedMessage id="domains.none.message.title" tagName="span" />
                    }
                    icon="frown outline"
                />
            )}
        </div>
    );
};

const mapDispatchToProps = {
    fetchUpdateContacts,
    updateContactsConfirm,
};

export default connect(null, mapDispatchToProps)(DomainList);

DomainList.propTypes = {
    domainCount: PropTypes.number,
    domainTotal: PropTypes.number,
    isTech: PropTypes.any,
    lang: PropTypes.string,
    onSelectTech: PropTypes.func,
    isUpdateContact: PropTypes.any,
    fetchUpdateContacts: PropTypes.func.isRequired,
    updateContactsConfirm: PropTypes.func.isRequired,
};

DomainList.defaultProps = {
    domainCount: 0,
    domainTotal: 0,
    isTech: 'init',
    isUpdateContact: true,
    lang: 'et',
    onSelectTech: () => {},
};
