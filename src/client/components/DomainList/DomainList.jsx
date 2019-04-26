import React, { Component } from 'react';
import PropTypes, { instanceOf } from 'prop-types';
import MediaQuery from 'react-responsive';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Table, Button, Form, Input, Icon, Transition, Dropdown, Container, Pagination } from 'semantic-ui-react';
import Masonry from 'react-masonry-component';
import Flatpickr from 'react-flatpickr';
import { Estonian } from 'flatpickr/dist/l10n/et';
import { Russian } from 'flatpickr/dist/l10n/ru';
import classNames from 'classnames';
import { withCookies, Cookies } from 'react-cookie';
import DomainGridItem from './GridItem';
import DomainListItem from './ListItem';
import domainStatuses from '../../utils/domainStatuses';
import staticMessages from '../../utils/staticMessages';
import {PageMessage} from '../index';

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

class DomainList extends Component {
  
  state = {
    isGrid: true,
    isAdvSearchOpen: false,
    queryKeys: '',
    queryRegistrant: 'all',
    queryStatus: 'all',
    queryValidToMin: null,
    queryValidToMax: null,
    minValidToDate: null,
    maxValidToDate: null,
    filteredDomains: [],
    registrants: [],
    statuses: [],
    activePage: 1,
    perPage: 24
  };
  
  masonry = React.createRef();
  
  componentDidMount() {
    const { cookies, domains, lang } = this.props;
    
    let statuses = [];
    let registrants = [];
    let minValidToDate = domains[0].valid_to;
    let maxValidToDate = domains[0].valid_to;
    let queryValidToMin = domains[0].valid_to;
    let queryValidToMax = domains[0].valid_to;
    
    const sortedDomains = domains.map(item => {
      
      statuses = [...new Set([...statuses, ...item.statuses])];
      
      item.statuses.sort((a, b) => domainStatuses[a].priority - domainStatuses[b].priority);
      
      minValidToDate = (item.valid_to < minValidToDate) ? item.valid_to : minValidToDate;
      queryValidToMin = (item.valid_to < queryValidToMin) ? item.valid_to : queryValidToMin;
      maxValidToDate = (item.valid_to > maxValidToDate) ? item.valid_to : maxValidToDate;
      queryValidToMax = (item.valid_to > queryValidToMax) ? item.valid_to : queryValidToMax;
      
      if (registrants.findIndex(registrant => registrant.key === item.registrant.id) === -1) {
        registrants.push({
          key: item.registrant.id,
          text: item.registrant.name,
          value: item.registrant.id,
        });
      }
      
      return item;
      
    });
    
    statuses.forEach((item, i) => {
      let statusColor = 'grey';
      let statusLabel = 'undefined';
      if (domainStatuses[item]) {
        statusColor = domainStatuses[item].color;
        statusLabel = domainStatuses[item][lang].label;
      }
      statuses.splice(i, 1, {
        key: statusLabel,
        text: statusLabel,
        value: item,
        label: { color: statusColor, empty: true, circular: true }
      });
    });
    
    statuses.sort((a, b) => domainStatuses[a.value].priority - domainStatuses[b.value].priority);
    
    registrants = registrants.filter((obj, index) => registrants.map(registrant => registrant.key).indexOf(obj.key) === index);
    
    this.setState({
      isGrid: cookies.get('domains_is_grid') ? JSON.parse(cookies.get('domains_is_grid')) : true,
      statuses: [{
        key: 0,
        text: domainStatuses.all[lang].label,
        value: 'all',
        label: {
          color: domainStatuses.all.color,
          empty: true,
          circular: true
        },
      }, ...statuses],
      registrants: [{
        key: 0,
        text: staticMessages[lang].domain_list.all_registrants,
        value: 'all',
      }, ...registrants],
      filteredDomains: sortedDomains,
      minValidToDate: new Date(minValidToDate),
      maxValidToDate: new Date(maxValidToDate),
      queryValidToMin: new Date(queryValidToMin),
      queryValidToMax: new Date(queryValidToMax),
      perPage: Number(cookies.get('domains_per_page')) || 24
    });
  }
  
  toggleView = () => {
    const { cookies } = this.props;
    const { isGrid } = this.state;
    cookies.set('domains_is_grid', !isGrid, { path: '/' });
    this.setState(prevState => ({
      ...prevState,
      activePage: 1,
      isGrid: !isGrid
    }));
    setTimeout(() => {
      this.masonry.current.performLayout();
    });
  };
  
  toggleAdvSearch = () => {
    this.setState(prevState => ({
      isAdvSearchOpen: !prevState.isAdvSearchOpen
    }));
  };
  
  setMinDate = (selectedDates) => {
    this.setState({ queryValidToMin: new Date(selectedDates[0]) });
  };
  
  setMaxDate = (selectedDates) => {
    this.setState({ queryValidToMax: new Date(selectedDates[0]).setHours(23,59,59) });
  };
  
  handlePageChange = (e, { activePage }) => {
    this.setState(prevState => ({
      ...prevState,
      activePage
    }));
  };
  
  handleItemsPerPage = (event, { value }) => {
    const { cookies } = this.props;
    cookies.set('domains_per_page', value, { path: '/' });
    this.setState(prevState => ({
      ...prevState,
      activePage: 1,
      perPage: value
    }));
  };
  
  handleChange = (event, {name, value}) => {
    if (name in this.state) {
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  handleSubmit = () => {
    const { domains } = this.props;
    let filteredDomains = [...domains];
    const { queryKeys, queryRegistrant, queryStatus, queryValidToMin, queryValidToMax } = this.state;
    if (queryKeys.length) {
      const query = queryKeys.toString().toLowerCase();
      filteredDomains = filteredDomains.filter(domain => domain.name.toLowerCase().includes(query) ||
          domain.tech_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.admin_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.nameservers.some(item => item.hostname.toLowerCase().includes(query) ||
            item.ipv4.toString().toLowerCase().includes(query) ||
            item.ipv6.toString().toLowerCase().includes(query))
      );
      this.setState(prevState => ({
        ...prevState,
        activePage: 1,
        filteredDomains
      }));
    } else if (queryKeys.length === 0) {
      this.setState(prevState => ({
        ...prevState,
        activePage: 1,
        domains
      }));
    }
    if (queryStatus.length && queryStatus !== 'all') {
      filteredDomains = filteredDomains.filter(domain => domain.statuses.indexOf(queryStatus) > -1);
      this.setState({ filteredDomains });
    } else if (queryStatus === 'all') {
      this.setState({ filteredDomains });
    }
    if (queryValidToMin && queryValidToMax) {
      filteredDomains = filteredDomains.filter(domain => new Date(domain.valid_to) >= queryValidToMin && new Date(domain.valid_to) <= queryValidToMax);
      this.setState({ filteredDomains });
    }
    if (queryRegistrant.length && queryRegistrant !== 'all') {
      filteredDomains = filteredDomains.filter(domain => domain.registrant.id.indexOf(queryRegistrant) > -1);
      this.setState({ filteredDomains });
    } else if (queryRegistrant !== 'all') {
      this.setState({ filteredDomains });
    }
  };
  
  handleReset = () => {
    const { domains } = this.props;
    this.setState(prevState => ({
      ...prevState,
      queryKeys: '',
      queryStatus: 'all',
      queryRegistrant: 'all',
      queryValidToMin: prevState.minValidToDate,
      queryValidToMax: prevState.maxValidToDate,
      domains,
    }));
  };
  
  render() {
    const { lang, contacts, domains } = this.props;
    const {
      isGrid,
      isAdvSearchOpen,
      queryKeys,
      queryStatus,
      queryRegistrant,
      queryValidToMin,
      queryValidToMax,
      minValidToDate,
      maxValidToDate,
      filteredDomains,
      registrants,
      statuses,
      activePage,
      perPage
    } = this.state;
    const totalDomains = domains.length || 0;
    
    const getLocale = (locale) => {
      if (locale === 'et') {
        return Estonian;
      }
      if (locale === 'ru') {
        return Russian;
      }
      return {};
    };
    
    // Set valid_to date range datepicker options
    const dateStartOptions = {
      locale: getLocale(lang),
      dateFormat: 'd.m.Y',
      defaultDate: minValidToDate,
      minDate: minValidToDate,
      maxDate: queryValidToMax || maxValidToDate
    };
  
    const dateEndOptions = {
      locale: getLocale(lang),
      dateFormat: 'd.m.Y',
      defaultDate: maxValidToDate,
      minDate: queryValidToMin || minValidToDate,
      maxDate: maxValidToDate
    };
  
  
    const paginatedDomains = [];
    const copied = [...filteredDomains];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
      paginatedDomains.push(copied.splice(0, perPage));
    }
    
    return (
      <div className='domains-list--wrap'>
        <div className='page--header'>
          <Container>
            <div className='page--header--text'>
              <FormattedHTMLMessage
                id='domains.title'
                defaultMessage='Minu domeenid <span>({userTotalDomains})</span>'
                tagName='h2'
                values={{
                  userTotalDomains: totalDomains
                }}
              />
            </div>
            <Form className='form-filter' onSubmit={this.handleSubmit}>
              <div className='form-filter--search'>
                <div className='form-filter--actions' />
                <div className='search-field'>
                  <Input className='icon' placeholder='Otsi domeeni' type='text' name='queryKeys' size='massive' value={queryKeys} onChange={this.handleChange} />
                  <Button type='reset' color='orange' icon='sync' onClick={this.handleReset} />
                  <Button type='submit' primary icon='arrow right'/>
                </div>
                <div className='form-filter--actions'>
                  <Icon className={classNames('action--filter', { 'active': isAdvSearchOpen })} name='filter' size='big' link onClick={this.toggleAdvSearch} />
                  <MediaQuery query="(min-width: 768px)" values={{ width: 1224 }}>
                    <Icon className={classNames('action--list', { 'active': !isGrid })} name='th list' size='big' link onClick={this.toggleView} />
                    <Icon className={classNames('action--grid', { 'active': isGrid })} name='th' size='big' link onClick={this.toggleView} />
                  </MediaQuery>
                </div>
              </div>
              <Transition visible={isAdvSearchOpen} animation='slide down'>
                <div className='form-filter--adv-search'>
                  <Form.Group>
                    <Form.Field width='5'>
                      <FormattedMessage
                        id='domains.form.select_registrant'
                        defaultMessage='Registreerija'
                        tagName='label'
                      />
                      <Dropdown name='queryRegistrant' fluid selection search options={registrants} value={queryRegistrant} onChange={this.handleChange}/>
                    </Form.Field>
                    <Form.Field width='5'>
                      <FormattedMessage
                        id='domains.form.date_range'
                        defaultMessage='Kehtivusaeg'
                        tagName='label'
                      />
                      <Form.Group className='date-range'>
                        <div className='field'>
                          <div className='ui right icon input'>
                            <Flatpickr options={dateStartOptions} onClose={this.setMinDate}/>
                            <Icon name='calendar alternate' link/>
                          </div>
                        </div>
                        <span className='date-range-sep'>–</span>
                        <div className='field'>
                          <div className='ui right icon input'>
                            <Flatpickr options={dateEndOptions} onClose={this.setMaxDate}/>
                            <Icon name='calendar alternate' link/>
                          </div>
                        </div>
                      </Form.Group>
                    </Form.Field>
                    <Form.Field width='6'>
                      <FormattedMessage
                        id='domains.form.select_status'
                        defaultMessage='Staatus'
                        tagName='label'
                      />
                      <Dropdown name='queryStatus' fluid selection options={statuses} value={queryStatus} onChange={this.handleChange}/>
                    </Form.Field>
                    <div className='form-actions'>
                      <Button primary>
                        <FormattedMessage
                          id='domains.form.filter'
                          defaultMessage='Filtreeri'
                          tagName='span'
                        />
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </Transition>
            </Form>
          </Container>
        </div>
        { domains.length ? (
          <React.Fragment>
            { paginatedDomains.length ? (
              <React.Fragment>
                <Transition visible={isGrid} animation='fade' duration={300}>
                  <div className='domains-grid--wrap'>
                    <Masonry
                      ref={this.masonry}
                      className='domains-grid'
                      options={ masonryOptions }
                      disableImagesLoaded
                      enableResizableChildren
                    >
                      { paginatedDomains[activePage - 1].map(domain => (
                        <DomainGridItem key={domain.id} domain={domain} contacts={contacts} lang={lang} />
                      ))}
                    </Masonry>
                  </div>
                </Transition>
                <Transition visible={!isGrid} animation='fade' duration={300}>
                  <div>
                    <div className='domains-list'>
                      <Table celled verticalAlign='top' unstackable>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='domains.domain_name'
                                defaultMessage='Domeeninimi'
                                tagName='span'
                              />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='domains.registrar'
                                defaultMessage='Registripidaja'
                                tagName='span'
                              />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='domains.status'
                                defaultMessage='Staatus'
                                tagName='span'
                              />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='domains.valid_until'
                                defaultMessage='Kehtiv kuni'
                                tagName='span'
                              />
                            </Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          { paginatedDomains[activePage - 1].map(domain => (
                            <DomainListItem key={domain.id} domain={domain} lang={lang}/>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  </div>
                </Transition>
                <div className='paginator'>
                  <Container>
                    <Pagination
                      activePage={ activePage }
                      onPageChange={ this.handlePageChange }
                      totalPages={ paginatedDomains.length }
                      firstItem={ null }
                      lastItem={ null }
                      prevItem={{
                        content: (
                          <React.Fragment>
                            <Icon name='arrow left' />
                            <FormattedMessage
                              id='pagination.previous'
                              defaultMessage='Eelmised'
                              tagName='span'
                            />
                          </React.Fragment>),
                        icon: true,
                        disabled: activePage === 1,
                      }}
                      nextItem={{
                        content: (
                          <React.Fragment>
                            <FormattedMessage
                              id='pagination.next'
                              defaultMessage='Järgmised'
                              tagName='span'
                            />
                            <Icon name='arrow right' />
                          </React.Fragment>),
                        icon: true,
                        disabled: activePage === paginatedDomains.length
                      }}
                    />
                    <Form>
                      <Form.Field inline>
                        <FormattedMessage
                          id='pagination.per_page'
                          defaultMessage='Tulemusi lehel'
                          tagName='label'
                        />
                        <Dropdown selection options={perPageOptions} value={perPage} onChange={this.handleItemsPerPage} />
                      </Form.Field>
                    </Form>
                  </Container>
                </div>
              </React.Fragment>
            ) : (
              <PageMessage
                headerContent={(
                  <FormattedMessage
                    id="domains.search.message.title"
                    defaultMessage="Otsingule vastavaid domeene ei leitud"
                    tagName="span"
                  />
                )}
              />
            )}
          </React.Fragment>
        ) : (
          <PageMessage
            headerContent={(
              <FormattedMessage
                id="domains.none.message.title"
                defaultMessage="Teile ei kuulu hetkel ühtegi domeeni"
                tagName="span"
              />
            )}
            icon="frown outline"
          />
        )}
      </div>
    );
  }
}

DomainList.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
  lang: PropTypes.string.isRequired,
};

export default withCookies(DomainList);