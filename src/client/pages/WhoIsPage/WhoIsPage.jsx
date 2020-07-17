/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {Button, Form, Icon, Container, Table, Input, Pagination, Dropdown} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {withCookies} from 'react-cookie';
import MediaQuery from 'react-responsive';
import { Loading, MainLayout, MessageModule, PageMessage, WhoIsConfirmDialog } from '../../components';
import Domain from './Domain';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

const perPageOptions = [
  { key: 6, text: '6', value: 6 },
  { key: 12, text: '12', value: 12 },
  { key: 24, text: '24', value: 24 },
];

const WhoIsPage = ({ cookies, fetchContacts, initialContacts, initialDomains, message, ui, updateContact, user }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
  const [perPage, setPerPage] = useState(Number(cookies.get('whois_per_page')) || 12);
  const [activePage, setActivePage] = useState(1);
  const [queryKeys, setQueryKeys] = useState('');
  const [contacts, setContacts] = useState({});
  const [domains, setDomains] = useState(Object.values(initialDomains));
  const { uiElemSize, lang } = ui;

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
    cookies.set('whois_per_page', value, { path: '/whois' });
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
      const results = Object.values(initialDomains).filter(domain => {
        return (domain.name.toLowerCase().includes(query) ||
          domain.tech_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.admin_contacts.some(item => item.name.toLowerCase().includes(query)) ||
          domain.nameservers.some(item => item.hostname.toLowerCase().includes(query) ||
            item.ipv4.toString().toLowerCase().includes(query) ||
            item.ipv6.toString().toLowerCase().includes(query)));
      });
      setDomains(results.length ? results : []);
    } else if (queryKeys.length === 0) {
      setDomains(Object.values(initialDomains));
    }
    setActivePage(1);
  };

  const handleWhoIsChange = (data) => {
    setContacts(prevState => Object.entries(prevState).reduce((acc, [id, contact]) => {
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
    }, {}));
    setIsDirty(true);
  };

  const toggleSubmitConfirmModal = () => {
    setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
  };

  const handleWhoIsSubmit = async () => {
    setIsLoading(true);
    setIsSubmitConfirmModalOpen(false);
    await Promise.all(Object.values(contacts).filter(({ changed }) => changed).map(contact => {
      const form = {
        disclosed_attributes: [...contact.disclosed_attributes]
      };
      return updateContact(contact.id, form);
    }));
    setIsDirty(false);
    setIsLoading(false);
  };

  return (
    <MainLayout hasBackButton titleKey="whois.title" ui={ui} user={user}>
      { !isLoading && message && <MessageModule message={message} lang={lang} /> }
      <div className='page page--whois'>
        { initialDomains ? (
          <React.Fragment>
            <div className='page--header'>
              <Container>
                <div className="page--header--text">
                  <FormattedMessage
                    id='whois.content.title'
                    tagName='h2'
                  />
                  <FormattedMessage
                    id='whois.content.text'
                    tagName='p'
                  />
                </div>
                <Form className='form-filter' onSubmit={handleSearch}>
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
                        onChange={handleSearchChange}
                      />
                      <Button type='reset' color='orange' icon='sync' onClick={handleSearchReset} />
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
                            id='actions.save'
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
                        tagName="span"
                      />
                    )}
                  />
                )}
              </React.Fragment>
            ) : (
              <div className="page--content">
                <Container>
                  <Form onSubmit={toggleSubmitConfirmModal} id='whois-page-form'>
                    <Table verticalAlign='top'>
                      <Table.Header>
                        <MediaQuery query="(min-width: 768px)" values={{ width: 1224 }}>
                          <Table.Row>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='whois.domain'
                              />
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='whois.publicInfo'
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
                                  id='actions.save'
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
                                id='actions.save'
                              />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      </Table.Footer>
                      <Table.Body>
                        {paginatedDomains[activePage - 1].map(domain => (
                          <Domain
                            key={domain.id}
                            name={domain.name}
                            contacts={Helpers.getUserContacts(
                              user,
                              domain,
                              contacts
                            )}
                            lang={lang}
                            onChange={handleWhoIsChange}
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
                      onPageChange={(e, page) => setActivePage(page) }
                      totalPages={ paginatedDomains.length }
                      firstItem={ null }
                      lastItem={ null }
                      prevItem={{
                        content: (
                          <React.Fragment>
                            <Icon name='arrow left' />
                            <FormattedMessage
                              id='pagination.previous'
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
                          id='pagination.perPage'
                          tagName='label'
                        />
                        <Dropdown
                          selection
                          options={perPageOptions}
                          value={perPage}
                          onChange={handleItemsPerPage}
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
          </React.Fragment>
        ) : (
          <PageMessage
            headerContent={(
              <FormattedMessage
                id="whois.none.message.title"
              />
            )}
            icon="frown outline"
          />
        )}
      </div>
    </MainLayout>
  );
};

const mapStateToProps = (state) => {
  return {
    initialDomains: state.domains.data,
    initialContacts: state.contacts.data,
  };
};

export default withCookies(connect(
  mapStateToProps,
  {
    ...contactsActions
  }
)(WhoIsPage));
