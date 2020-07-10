/* eslint-disable camelcase */
import React, {Component} from 'react';
import { FormattedMessage } from 'react-intl';
import {Button, Form, Icon, Container, Table, Input, Pagination, Dropdown} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {withCookies} from 'react-cookie';
import MediaQuery from 'react-responsive';
import { Helmet, Loading, MainLayout, MessageModule, PageMessage, WhoIsConfirmDialog } from '../../components';
import Domain from './Domain';
import Helpers from '../../utils/helpers';
import * as contactsActions from '../../redux/reducers/contacts';

const perPageOptions = [
  { key: 6, text: '6', value: 6 },
  { key: 12, text: '12', value: 12 },
  { key: 24, text: '24', value: 24 },
];

class WhoIsPage extends Component {

  state = {
    isDirty: false,
    isLoading: true,
    isSubmitConfirmModalOpen: false,
    perPage: 12,
    activePage: 1,
    queryKeys: null,
    contacts: {},
    domains: [],
    message: null,
  };

  componentDidMount() {
    const { fetchContacts, initialDomains, cookies } = this.props;
    (async () => {
      const contacts = initialDomains.reduce((acc, { admin_contacts, tech_contacts }) => [
        ...new Set([...acc, ...[...admin_contacts.map(({ id }) => id), ...tech_contacts.map(({ id }) => id)]])
      ], []);
      const res = await Promise.all(contacts.map(id => fetchContacts(id)));
      this.setState(prevState => ({
        ...prevState,
        perPage: Number(cookies.get('whois_per_page')) || 12,
        contacts: res.data,
        domains: initialDomains,
        isLoading: false,
      }));
    })();
  }

  handlePageChange = (e, { activePage }) => {
    this.setState(prevState => ({
      ...prevState,
      activePage
    }));
  };
  
  handleItemsPerPage = (event, { value }) => {
    const { cookies } = this.props;
    cookies.set('whois_per_page', value, { path: '/whois' });
    this.setState(prevState => ({
      ...prevState,
      activePage: 1,
      perPage: value
    }));
  };
  
  handleSearchChange = (event, {name, value}) => {
    const { initialDomains } = this.props;
    if (value === '') {
      this.setState(prevState => ({
        ...prevState,
        [name]: value,
        domains: initialDomains
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  
  handleSearchReset = () => {
    const { initialDomains, initialContacts } = this.props;
    this.setState(prevState => ({
      ...prevState,
      queryKeys: '',
      activePage: 1,
      contacts: initialContacts.data.reduce((acc, contact) => ({
        ...acc,
        [contact.id]: contact
      }), {}),
      domains: initialDomains,
    }));
  };
  
  handleSearch = () => {
    const { initialDomains } = this.props;
    const { queryKeys } = this.state;
    let domains = [...initialDomains];
    if (queryKeys.length > 0) {
      const query = queryKeys.toString().toLowerCase();
      domains = domains.filter(domain => {
        return (domain.name.toLowerCase().includes(query) ||
          domain.tech_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.admin_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.nameservers.some(item => item.hostname.toLowerCase().includes(query) ||
            item.ipv4.toString().toLowerCase().includes(query) ||
            item.ipv6.toString().toLowerCase().includes(query)));
      });
      this.setState(prevState => ({
        ...prevState,
        activePage: 1,
        domains: domains.length ? domains : []
      }));
    } else if (queryKeys.length === 0) {
      this.setState(prevState => ({
        ...prevState,
        activePage: 1,
        domains: initialDomains
      }));
    }
  };
  
  handleWhoIsChange = (data) => {
    this.setState(prevState => ({
      ...prevState,
      contacts: Object.entries(prevState.contacts).reduce((acc, [id, contact]) => {
        if (data[id]) {
          return {
            ...acc,
            [id]: {
              ...contact,
              disclosed_attributes: data[id].disclosed_attributes,
              changed: true
            }
          };
        }
        return {
          ...acc,
          [id]: contact
        };
      }, {}),
      isDirty: true
    }));
  };
  
  toggleSubmitConfirmModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isSubmitConfirmModalOpen: !prevState.isSubmitConfirmModalOpen,
    }));
  };
  
  handleWhoIsSubmit = async () => {
    const { setContacts, initialContacts } = this.props;
    const { contacts } = this.state;
    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
      isSubmitConfirmModalOpen: false
    }));
    await Promise.all(Object.values(contacts).filter(contact => contact.changed).map(contact => {
      const form = {
        disclosed_attributes: [...contact.disclosed_attributes]
      };
      return setContacts(contact.id, form);
    }));
    this.setState(prevState => ({
      ...prevState,
      isDirty: false,
      isLoading: false,
      message: {
        code: initialContacts.status,
        type: 'whois',
      },
    }));
  };
  
  render() {
    const { ui, user, initialDomains, history } = this.props;
    const { uiElemSize, lang } = ui;
    const { domains, isDirty, queryKeys, perPage, activePage, contacts, isLoading, message, isSubmitConfirmModalOpen } = this.state;
    const paginatedDomains = [];
    const copied = [...domains];
    const numOfChild = Math.ceil(copied.length / perPage);
    for (let i = 0; i < numOfChild; i += 1) {
      paginatedDomains.push(copied.splice(0, perPage));
    }
    console.log({ initialDomains, contacts });
    return (
      <MainLayout ui={ui} user={user}>
        <FormattedMessage
          id="whois.page_title"
          defaultMessage='WHOIS Privaatsusseaded | EIS Registreerijaportaal'
        >
          {title => (
            <Helmet>
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <div className='main-hero'>
          <FormattedMessage
            id='whois.title'
            defaultMessage='WHOIS Privaatsusseaded'
            tagName='h1'
          />
          <button type='button' className='back-link' onClick={history.goBack}>
            <Icon name='arrow left' />
            <FormattedMessage
              id='hero.link.back'
              defaultMessage='Tagasi'
              tagName='span'
            />
          </button>
        </div>
        { !isLoading && message && <MessageModule message={message} lang={lang} /> }
        <div className='page page--whois'>
          { initialDomains ? (
            <React.Fragment>
              <div className='page--header'>
                <Container>
                  <div className="page--header--text">
                    <FormattedMessage
                      id='whois.content.title'
                      defaultMessage='Dapibus Ullamcorper Mollis Bibendum'
                      tagName='h2'
                    />
                    <FormattedMessage
                      id='whois.content.text'
                      defaultMessage='Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia
                      odio sem nec elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer
                      posuere erat a ante venenatis dapibus posuere velit aliquet.'
                      tagName='p'
                    />
                  </div>
                  <Form className='form-filter' onSubmit={this.handleSearch}>
                    <div className='form-filter--search'>
                      <div className='form-filter--actions'/>
                      <div className='search-field'>
                        <Input
                          className='icon'
                          placeholder='Otsi domeeni'
                          type='text'
                          name='queryKeys'
                          size='massive'
                          defaultValue={queryKeys}
                          disabled={isLoading}
                          onChange={this.handleSearchChange}
                        />
                        <Button type='reset' color='orange' icon='sync' onClick={this.handleSearchReset} />
                        <Button type='submit' primary icon='arrow right'/>
                      </div>
                      <div className='form-filter--actions'>
                        <MediaQuery query="(min-width: 768px)" values={{ width: 1224 }}>
                          <Button
                            type='submit'
                            form='whois-page-form'
                            primary
                            disabled={isLoading || !isDirty}
                            loading={isLoading}
                            size={uiElemSize}
                          >
                            <FormattedMessage
                              id='whois.save'
                              defaultMessage='Salvesta'
                              tagName='span'
                            />
                          </Button>
                        </MediaQuery>
                      </div>
                    </div>
                  </Form>
                </Container>
              </div>
              { isLoading || !domains.length  ? (
                <React.Fragment>
                  {isLoading && <Loading/>}
                  {!isLoading && !domains.length && (
                    <PageMessage
                      headerContent={(
                        <FormattedMessage
                          id="whois.search.message.title"
                          defaultMessage="Otsingule vastavaid domeene ei leitud"
                          tagName="span"
                        />
                      )}
                    />
                  )}
                </React.Fragment>
              ) : (
                <div className="page--content">
                  <Container>
                    <Form onSubmit={this.toggleSubmitConfirmModal} id='whois-page-form'>
                      <Table verticalAlign='top'>
                        <Table.Header>
                          <MediaQuery query="(min-width: 768px)" values={{ width: 1224 }}>
                            <Table.Row>
                              <Table.HeaderCell>
                                <FormattedMessage
                                  id='whois.domain'
                                  defaultMessage='Domeen'
                                />
                              </Table.HeaderCell>
                              <Table.HeaderCell>
                                <FormattedMessage
                                  id='whois.public_info'
                                  defaultMessage='Info avalik'
                                />
                              </Table.HeaderCell>
                              <Table.HeaderCell />
                            </Table.Row>
                          </MediaQuery>
                          <MediaQuery query="(max-width: 767px)" values={{ width: 1224 }}>
                            <Table.Row>
                              <Table.HeaderCell>
                                <Button
                                  type='submit'
                                  form='whois-page-form'
                                  primary
                                  disabled={isLoading || !isDirty}
                                  loading={isLoading}
                                  size={uiElemSize}
                                >
                                  <FormattedMessage
                                    id='whois.save'
                                    defaultMessage='Salvesta'
                                    tagName='span'
                                  />
                                </Button>
                              </Table.HeaderCell>
                            </Table.Row>
                          </MediaQuery>
                        </Table.Header>
                        <Table.Footer>
                          <Table.Row>
                            <Table.Cell colSpan={3} textAlign='right'>
                              <Button
                                type='submit'
                                form='whois-page-form'
                                primary
                                disabled={isLoading || !isDirty}
                                loading={isLoading}
                                size={uiElemSize}
                              >
                                <FormattedMessage
                                  id='whois.save'
                                  defaultMessage='Salvesta'
                                  tagName='span'
                                />
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        </Table.Footer>
                        <Table.Body>
                          {paginatedDomains[activePage - 1].map(domain => (
                            <Domain
                              key={domain.id}
                              user={user}
                              domain={domain}
                              contacts={contacts}
                              lang={lang}
                              handleWhoIsChange={this.handleWhoIsChange}
                            />
                          ))}
                        </Table.Body>
                      </Table>
                    </Form>
                  </Container>
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
                          <Dropdown
                            selection
                            options={perPageOptions}
                            value={perPage}
                            onChange={this.handleItemsPerPage}
                          />
                        </Form.Field>
                      </Form>
                    </Container>
                  </div>
                </div>
              )}
              <WhoIsConfirmDialog
                changedDomains={Helpers.getChangedUserContactsByDomain(domains, Object.values(contacts))}
                onCancel={this.toggleSubmitConfirmModal}
                onConfirm={this.handleWhoIsSubmit}
                open={isSubmitConfirmModalOpen}
                ui={ui}
              />
            </React.Fragment>
          ) : (
            <PageMessage
              headerContent={(
                <FormattedMessage
                  id="whois.none.message.title"
                  defaultMessage="Teile ei kuulu hetkel ühtegi domeeni"
                  tagName="span"
                />
              )}
              icon="frown outline"
            />
          )}
        </div>
      </MainLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    initialDomains: state.domains.data,
    initialContacts: state.contacts,
  };
};

export default withCookies(connect(
  mapStateToProps,
  {
    ...contactsActions
  }
)(WhoIsPage));
