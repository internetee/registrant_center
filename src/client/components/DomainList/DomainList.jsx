import React, { useEffect, useRef, useState } from 'react';
import MediaQuery from 'react-responsive';
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
} from 'semantic-ui-react';
import Masonry from 'react-masonry-component';
import Flatpickr from 'react-flatpickr';
import { Estonian } from 'flatpickr/dist/l10n/et';
import { Russian } from 'flatpickr/dist/l10n/ru';
import classNames from 'classnames';
import { withCookies } from 'react-cookie';
import DomainGridItem from './GridItem';
import DomainListItem from './ListItem';
import PageMessage from '../PageMessage/PageMessage';
import domainStatuses from '../../utils/domainStatuses.json';

const masonryOptions = {
    initLayout: true,
    horizontalOrder: true,
    percentPosition: true,
    gutter: 0,
    columnWidth: '.domains-grid--item',
    itemSelector: '.domains-grid--item',
    transitionDuration: 300,
};

const perPageOptions = [
    { key: 6, text: '6', value: 6 },
    { key: 12, text: '12', value: 12 },
    { key: 24, text: '24', value: 24 },
];

const getLocale = locale => {
    if (locale === 'et') {
        return Estonian;
    }
    if (locale === 'ru') {
        return Russian;
    }
    return {};
};

const DomainList = ({ cookies, domains, lang }) => {
    const { formatMessage } = useIntl();
    const [isGrid, setIsGrid] = useState(
        cookies.get('domains_is_grid') ? JSON.parse(cookies.get('domains_is_grid')) : true
    );
    const [isAdvSearchOpen, setIsAdvSearchOpen] = useState(false);
    const [form, setForm] = useState({
        queryKeys: '',
        queryRegistrant: 'all',
        queryStatus: 'all',
        queryValidToMin: null,
        queryValidToMax: null,
    });
    const { queryKeys, queryRegistrant, queryStatus, queryValidToMin, queryValidToMax } = form;
    const [minValidToDate, setMinValidToDate] = useState(null);
    const [maxValidToDate, setMaxValidToDate] = useState(null);
    const [filteredDomains, setFilteredDomains] = useState([]);
    const [registrantsOptions, setRegistrantsOptions] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [perPage, setPerPage] = useState(Number(cookies.get('domains_per_page')) || 24);
    const [domainsList, setDomainsList] = useState([]);
    const totalDomains = domains.length || 0;

    const masonry = useRef(null);

    useEffect(() => {
        if (domains.length) {
            const { registrants, allStatuses, maxDate, minDate, sortedDomains } = domains.reduce(
                (acc, domain) => ({
                    ...acc,
                    minDate: domain.valid_to < acc.minDate ? domain.valid_to : acc.minDate,
                    maxDate: domain.valid_to > acc.maxDate ? domain.valid_to : acc.maxDate,
                    statuses: {
                        ...acc.statuses,
                        ...domain.statuses.reduce(
                            (statusesAcc, status) => ({
                                ...statusesAcc,
                                [status]: {
                                    key: status,
                                    text: formatMessage({ id: `domain.status.${status}` }),
                                    value: status,
                                    label: {
                                        circular: true,
                                        color: domainStatuses[status]?.color || 'grey',
                                        empty: true,
                                    },
                                },
                            }),
                            {}
                        ),
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
                    registrants: {
                        ...acc.registrants,
                        [domain.registrant.id]: {
                            text: domain.registrant.name,
                            value: domain.registrant.id,
                        },
                    },
                }),
                {
                    registrants: {
                        all: {
                            key: 0,
                            text: formatMessage({ id: 'domainsList.allRegistrants' }),
                            value: 'all',
                        },
                    },
                    allStatuses: {
                        all: {
                            key: 0,
                            text: domainStatuses.all[lang].label,
                            value: 'all',
                            label: {
                                color: domainStatuses.all.color,
                                empty: true,
                                circular: true,
                            },
                        },
                    },
                    maxDate: domains[0].valid_to,
                    minDate: domains[0].valid_to,
                    sortedDomains: [],
                }
            );

            setStatuses(
                Object.values(allStatuses).sort(
                    (a, b) => domainStatuses[a].priority - domainStatuses[b].priority
                )
            );
            setRegistrantsOptions(Object.values(registrants));
            setFilteredDomains(sortedDomains);
            setDomainsList(sortedDomains);
            setMinValidToDate(new Date(minDate));
            setMaxValidToDate(new Date(maxDate));
        }
    }, [domains]);

    // Set valid_to date range datepicker options
    const dateStartOptions = {
        locale: getLocale(lang),
        dateFormat: 'd.m.Y',
        defaultDate: minValidToDate,
        minDate: minValidToDate,
        maxDate: maxValidToDate,
    };

    const dateEndOptions = {
        locale: getLocale(lang),
        dateFormat: 'd.m.Y',
        defaultDate: maxValidToDate,
        minDate: minValidToDate,
        maxDate: maxValidToDate,
    };

    const paginatedDomains = [];
    const copied = [...filteredDomains];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
        paginatedDomains.push(copied.splice(0, perPage));
    }

    const toggleView = () => {
        cookies.set('domains_is_grid', !isGrid, { path: '/' });
        setActivePage(1);
        setIsGrid(prevState => !prevState);
        setTimeout(() => {
            if (filteredDomains.length > 0) {
                masonry.current.performLayout();
            }
        });
    };

    const toggleAdvSearch = () => {
        setIsAdvSearchOpen(prevState => !prevState);
    };

    const setMinDate = selectedDates => {
        setForm(prevState => ({
            ...prevState,
            queryValidToMin: new Date(selectedDates[0]).getTime(),
        }));
    };

    const setMaxDate = selectedDates => {
        setForm(prevState => ({
            ...prevState,
            queryValidToMax: new Date(selectedDates[0]).setHours(23, 59, 59),
        }));
    };

    const handleItemsPerPage = (event, { value }) => {
        cookies.set('domains_per_page', value, { path: '/' });
        setActivePage(1);
        setPerPage(value);
    };

    const handleChange = (event, { name, value }) => {
        setForm(prevState => ({
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
                    .filter(domain => {
                        const query = queryKeys.toString().toLowerCase();
                        if (query.length) {
                            return (
                                domain.name.toLowerCase().includes(query) ||
                                domain.tech_contacts.some(item =>
                                    item.name.toLowerCase().includes(query)
                                ) ||
                                domain.admin_contacts.some(item =>
                                    item.name.toLowerCase().includes(query)
                                ) ||
                                domain.nameservers.some(
                                    item =>
                                        item.hostname.toLowerCase().includes(query) ||
                                        item.ipv4
                                            .toString()
                                            .toLowerCase()
                                            .includes(query) ||
                                        item.ipv6
                                            .toString()
                                            .toLowerCase()
                                            .includes(query)
                                )
                            );
                        }
                        return true;
                    })
                    .filter(domain => {
                        if (queryStatus.length && queryStatus !== 'all') {
                            return domain.statuses.includes(queryStatus);
                        }
                        return true;
                    })
                    .filter(domain => {
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
                    .filter(domain => {
                        if (queryRegistrant.length && queryRegistrant !== 'all') {
                            return domain.registrant.id.includes(queryRegistrant);
                        }
                        return true;
                    })
            );
        }
    };

    const handleReset = () => {
        setForm({
            queryKeys: '',
            queryStatus: 'all',
            queryRegistrant: 'all',
            queryValidToMin: null,
            queryValidToMax: null,
            filteredDomains: domainsList,
        });
    };

    return (
        <div className="domains-list--wrap">
            <div className="page--header">
                <Container>
                    <div className="page--header--text">
                        <FormattedMessage
                            id="domains.title"
                            tagName="h2"
                            values={{
                                span: text => <span>{text}</span>,
                                userTotalDomains: totalDomains,
                            }}
                        />
                    </div>
                    <Form className="form-filter" onSubmit={handleSubmit}>
                        <div className="form-filter--search">
                            <div className="form-filter--actions" />
                            <div className="search-field">
                                <Input
                                    className="icon"
                                    name="queryKeys"
                                    onChange={handleChange}
                                    placeholder="Otsi domeeni"
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
                <React.Fragment>
                    {paginatedDomains.length ? (
                        <React.Fragment>
                            <Transition animation="fade" duration={300} visible={isGrid}>
                                <div className="domains-grid--wrap">
                                    <Masonry
                                        ref={masonry}
                                        className="domains-grid"
                                        disableImagesLoaded
                                        enableResizableChildren
                                        options={masonryOptions}
                                    >
                                        {paginatedDomains[activePage - 1].map(domain => (
                                            <DomainGridItem
                                                key={domain.id}
                                                domain={domain}
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
                                                {paginatedDomains[activePage - 1].map(domain => (
                                                    <DomainListItem
                                                        key={domain.id}
                                                        domain={domain}
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
                                                <React.Fragment>
                                                    <FormattedMessage
                                                        id="pagination.next"
                                                        tagName="span"
                                                    />
                                                    <Icon name="arrow right" />
                                                </React.Fragment>
                                            ),
                                            icon: true,
                                            disabled: activePage === paginatedDomains.length,
                                        }}
                                        onPageChange={(e, { activePage: page }) =>
                                            setActivePage(page)
                                        }
                                        prevItem={{
                                            content: (
                                                <React.Fragment>
                                                    <Icon name="arrow left" />
                                                    <FormattedMessage
                                                        id="pagination.previous"
                                                        tagName="span"
                                                    />
                                                </React.Fragment>
                                            ),
                                            icon: true,
                                            disabled: activePage === 1,
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
                        </React.Fragment>
                    ) : (
                        <PageMessage
                            headerContent={<FormattedMessage id="domains.search.message.title" />}
                        />
                    )}
                </React.Fragment>
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

export default withCookies(DomainList);
