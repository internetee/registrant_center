/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage} from 'react-intl';
import {Popup, Button, Form, Icon, Label, Container, Table, Modal, Confirm} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Helmet, Loading, WhoIsEdit, MessageModule, PageMessage, MainLayout, WhoIsConfirmDialog } from '../../components';
import domainStatuses from '../../utils/domainStatuses.json';
import * as domainsActions from '../../redux/reducers/domains';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

const DomainPage = ({
  domain,
  fetchDomain,
  history,
  contacts,
  lockDomain,
  match,
  ui,
  unlockDomain,
  updateContact,
  user,
}) => {
  const { uiElemSize, lang } = ui;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLockable, setIsLockable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
  const [isDomainLockModalOpen, setIsDomainLockModalOpen] = useState(false);
  const [userContacts, setUserContacts] = useState({});
  const [message, setMessage] = useState(null);
  const [registrantContacts, setRegistrantContacts] = useState(null);
  const { isLocked } = domain || {};

  useEffect(() => {
    if (domain) {
      (async () => {
        await fetchDomain(domain.id);
        setIsLoading(false);
      })();
    }
  }, []);
  
  useEffect(() => {
    if (domain && !isLoading) {
      const statuses = domain.statuses.sort((a, b) => domainStatuses[a].priority - domainStatuses[b].priority);
      const userContact = Helpers.getUserContacts(user, domain, contacts);
      if (Object.keys(userContact).length) {
        setUserContacts(userContact);
        setIsLockable(
          ['pendingDelete', 'serverHold'].every(status => !statuses.includes(status))
          && Object.values(userContact).some(item => item.roles.some(role => ['admin', 'registrant'].includes(role))));
      }
      setRegistrantContacts({
        ...domain.registrant,
        ...contacts[domain.registrant.id],
      });
    }
  }, [contacts, domain, isLoading, user]);
  
  const handleWhoIsChange = (data) => {
    setUserContacts(prevState => Object.entries(data).reduce((acc, [id, { disclosed_attributes }]) => ({
      ...acc,
      [id]: {
        ...prevState[id],
        disclosed_attributes
      }
    }), {}));
    setIsDirty(true);
  };
  
  const handleWhoIsSubmit = async () => {
    setIsSaving(true);
    setIsSubmitConfirmModalOpen(false);
    await Promise.all(Object.values(userContacts).map(contact => {
      const form = {
        disclosed_attributes: [...contact.disclosed_attributes]
      };
      return updateContact(contact.id, form);
    }));
    setIsDirty(false);
    setIsSaving(false);
    setMessage({
      code: 200,
      type: 'whois',
    });
  };
  
  
  const toggleSubmitConfirmModal = () => {
    setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
  };
  
  const toggleDomainLockModal = () => {
    setIsDomainLockModalOpen(!isDomainLockModalOpen);
  };
  
  const handleDomainLock = async uuid => {
    setIsSaving(true);
    setIsDomainLockModalOpen(false);
    setMessage(null);
    try {
      let res;
      if (isLocked) {
        res = await unlockDomain(uuid);
      } else {
        res = await lockDomain(uuid);
      }
      setMessage({
        code: res.status,
        type: `domain_${isLocked ? 'unlock' : 'lock'}`
      });
    } catch (error) {
      setMessage({
        type: `domain_${isLocked ? 'unlock' : 'lock'}`,
        code: 500
      });
      console.log(error); // eslint-disable-line no-console
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <Loading/>;
  }

  if (!domain) {
    return (
      <MainLayout ui={ui} user={user}>
        <FormattedMessage
          id="domain.domain_not_found_title"
          defaultMessage='Domeeni ei leitud | EIS Registreerijaportaal'
        >
          {title => (
            <Helmet>
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <div className='main-hero'>
          <h1>{ match.params.id }</h1>
          <button type='button' className='back-link' onClick={history.goBack}>
            <Icon name='arrow left'/>
            <FormattedMessage
              id='hero.link.back'
              defaultMessage='Tagasi'
            />
          </button>
        </div>
        <PageMessage
          headerContent={(
            <FormattedMessage
              id="domain.none.message.title"
              defaultMessage="Kahjuks sellise nimega domeeni ei leitud"
              tagName="span"
            />
          )}
          icon="frown outline"
        >
          <FormattedMessage
            id='domain.none.message.text'
            defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, consequuntur est facere fuga illum ipsa ipsum quasi quo! Commodi consequuntur eligendi harum non ut. Architecto blanditiis dignissimos nulla placeat praesentium.'
            tagName='p'
          />
        </PageMessage>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout ui={ui} user={user}>
      <FormattedMessage
        id="domain.page_title"
        defaultMessage='{domainName} | EIS Registreerijaportaal'
        values={{
          domainName: domain.name
        }}
      >
        {title => (
          <Helmet>
            <title>{title}</title>
          </Helmet>
        )}
      </FormattedMessage>
      <div className='main-hero'>
        <h1>{ domain.name }</h1>
        <button type='button' className='back-link' onClick={ history.goBack }>
          <Icon name='arrow left' />
          <FormattedMessage
            id='hero.link.back'
            defaultMessage='Tagasi'
          />
        </button>
      </div>
      { !isSaving && message && <MessageModule message={message} lang={lang} /> }
      <div className='page page--domain'>
        <div className='page--header'>
          <Container textAlign='center'>
            <div className="page--header--actions">
              <Button data-test='link-domain-edit' as={Link} primary size={ uiElemSize } to={`/domain/${domain.name}/edit`} content='Muuda kontakte'/>
              { isLockable && (
                <Button
                  data-test={isLocked ? 'open-unlock-modal' : 'open-lock-modal'}
                  primary
                  size={uiElemSize}
                  disabled={isSaving}
                  loading={isSaving}
                  onClick={toggleDomainLockModal}
                >
                  { isLocked ? (
                    <FormattedMessage
                      id='domain.unlock'
                      defaultMessage='Vabasta'
                    />
                  ) : (
                    <FormattedMessage
                      id='domain.lock'
                      defaultMessage='Lukusta'
                    />
                  )}
                </Button>
              )}
            </div>
          </Container>
        </div>
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.registrant'
                  defaultMessage='Registreerija'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.registrant.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
            </header>
            {registrantContacts && (
              <Table basic='very'>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell width='4'>
                      <FormattedMessage
                        id='domain.registrant.name'
                        defaultMessage='Nimi'
                        tagName='strong'
                      />
                    </Table.Cell>
                    <Table.Cell>{`${registrantContacts.name} ${registrantContacts.code ? `(${registrantContacts.code})` : ''}`}</Table.Cell>
                  </Table.Row>
                  {registrantContacts.ident && (
                    <Table.Row>
                      <Table.Cell width='4'>
                        <FormattedMessage
                          id='domain.registrant.ident'
                          defaultMessage='Isikukood'
                          tagName='strong'
                        />
                      </Table.Cell>
                      <Table.Cell>{registrantContacts.ident.code}</Table.Cell>
                    </Table.Row>
                  )}
                  {registrantContacts.email && (
                    <Table.Row>
                      <Table.Cell width='4'>
                        <FormattedMessage
                          id='domain.registrant.email'
                          defaultMessage='E-mail'
                          tagName='strong'
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <a href={`mailto:${registrantContacts.email}`}>{registrantContacts.email}</a>
                      </Table.Cell>
                    </Table.Row>
                  )}
                  {registrantContacts.phone && (
                    <Table.Row>
                      <Table.Cell width='4'>
                        <FormattedMessage
                          id='domain.registrant.phone'
                          defaultMessage='Telefon'
                          tagName='strong'
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
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.contacts'
                  defaultMessage='Kontaktid'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.contacts.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
            </header>
            <Table basic='very'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <FormattedMessage
                      id='domain.contact.type'
                      defaultMessage='Kontakti tüüp'
                      tagName='strong'
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <FormattedMessage
                      id='domain.contact.name'
                      defaultMessage='Nimi'
                      tagName='strong'
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <FormattedMessage
                      id='domain.contact.email'
                      defaultMessage='E-mail'
                      tagName='strong'
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <FormattedMessage
                      id='domain.contact.phone'
                      defaultMessage='Telefon'
                      tagName='strong'
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <DomainContacts type="tech" contacts={domain.tech_contacts} />
                <DomainContacts type="admin" contacts={domain.admin_contacts} />
              </Table.Body>
            </Table>
          </Container>
        </div>
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.statuses'
                  defaultMessage='Staatused'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.statuses.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
            </header>
            <Table basic='very'>
              <Table.Body>
                <DomainStatuses statuses={domain.statuses} lang={lang}/>
              </Table.Body>
            </Table>
          </Container>
        </div>
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.registrar'
                  defaultMessage='Registripidaja'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.registrar.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
            </header>
            <Table basic='very'>
              <Table.Body>
                <Table.Row>
                  <Table.Cell width='4'>
                    <FormattedMessage
                      id='domain.registrar.name'
                      defaultMessage='Nimi'
                      tagName='strong'
                    />
                  </Table.Cell>
                  <Table.Cell>{ domain.registrar.name }</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell width='4'>
                    <FormattedMessage
                      id='domain.registrar.website'
                      defaultMessage='Koduleht'
                      tagName='strong'
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {domain.registrar && domain.registrar.website ? (
                      <a href={ domain.registrar.website.indexOf('http') > -1 ? domain.registrar.website : `//${domain.registrar.website}` } target='_blank' rel='noopener noreferrer'>{ domain.registrar.website }</a>
                    ) : '-'}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Container>
        </div>
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.nameservers'
                  defaultMessage='Nimeserverid'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.nameservers.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
              { !domain.nameservers.length ? (
                <FormattedMessage
                  id='domain.nameservers.text'
                  defaultMessage='Nimeserverid puuduvad'
                  tagName='p'
                />
              ) : null }
            </header>
            { domain.nameservers.length ? (
              <Table basic='very'>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      <FormattedMessage
                        id='domain.hostname'
                        defaultMessage='Hostinimi'
                        tagName='strong'
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
            ) : null }
          </Container>
        </div>
        <div className='page--block'>
          <Container text>
            <header className='page--block--header'>
              <h2>
                <FormattedMessage
                  id='domain.whois_privacy'
                  defaultMessage='WHOIS Privaatsus'
                />
                <Popup trigger={<Icon name='question circle'/>} basic inverted>
                  <FormattedMessage
                    id='domain.whois_privacy.tooltip'
                    defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                  />
                </Popup>
              </h2>
              <FormattedMessage
                id='domain.whois_privacy.text'
                defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid animi assumenda consequatur cum dolorum eaque expedita.'
                tagName='p'
              />
            </header>
            <Form onSubmit={toggleSubmitConfirmModal}>
              <WhoIsEdit user={user} contacts={userContacts} lang={lang} onChange={handleWhoIsChange} />
              <div className='form-actions'>
                <Button type='submit' primary size={uiElemSize} loading={isSaving} disabled={!isDirty}>
                  <FormattedMessage
                    id='domain.whois_privacy.save'
                    defaultMessage='Salvesta'
                    tagName='span'
                  />
                </Button>
              </div>
            </Form>
          </Container>
        </div>
      </div>
      <Confirm
        size='large'
        open={isDomainLockModalOpen}
        closeOnEscape
        onConfirm={() => handleDomainLock(domain.id)}
        onCancel={toggleDomainLockModal}
        header={
          <Modal.Header>
            {isLocked ? (
              <FormattedMessage
                id='domain.unlock.title'
                defaultMessage='Kas oled kindel, et soovid domeeni vabastada?'
                tagName='h2'
              />
            ): (
              <FormattedMessage
                id='domain.lock.title'
                defaultMessage='Kas oled kindel, et soovid domeeni lukustada?'
                tagName='h2'
              />
            )}
          </Modal.Header>
        }
        content={
          <Modal.Content className='center'>
            {isLocked ? (
              <FormattedMessage
                id='domain.unlock.description'
                defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque dicta earum harum, inventore itaque maiores nemo nobis porro quasi rem repellendus repudiandae saepe sequi voluptas voluptates? Deleniti facere illum suscipit.'
                tagName='p'
              />
            ) : (
              <FormattedMessage
                id='domain.lock.description'
                defaultMessage='Sellisel juhul võimalikud vaid serveri poolsed muudatused seni kuni pole lukku eemaldatud. Kõik registripidaja poolsed toimingud va domeeni pikendamine on keelatud.'
                tagName='p'
              />
            )}
          </Modal.Content>
        }
        confirmButton={
          <Button data-test='lock-domain' primary size={ uiElemSize }>
            <FormattedMessage
              id='domain.lock.yes'
              defaultMessage='Jah'
              tagName='span'
            />
          </Button>
        }
        cancelButton={
          <Button data-test='close-lock-modal' secondary size={ uiElemSize }>
            <FormattedMessage
              id='domain.lock.no'
              defaultMessage='Ei'
              tagName='span'
            />
          </Button>
        }
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
  return nameservers.map(item => (
    <Table.Row key={item.ipv4}>
      <Table.Cell width='4'>{ item.hostname }</Table.Cell>
      <Table.Cell>{ item.ipv4 }</Table.Cell>
      <Table.Cell>{ item.ipv6 }</Table.Cell>
    </Table.Row>
  ));
};

const DomainStatuses = ({ statuses, lang }) => {
  return statuses.map(status => (
    <Table.Row key={ status }>
      <Table.Cell width='4'><Label circular color={domainStatuses[status].color} empty /> <strong>{ domainStatuses[status][lang].label }</strong></Table.Cell>
      <Table.Cell>{ domainStatuses[status][lang].definition }</Table.Cell>
    </Table.Row>
  ));
};

const DomainContacts = ({ type, contacts }) => {
  return contacts.map(item => (
    <Table.Row key={ item.id }>
      <Table.Cell width='3'>
        {type === 'admin' && (
          <FormattedMessage
            id='domain.contact.admin'
            defaultMessage='Admin'
            tagName='strong'
          />
        )}
        {type ==='tech' ? (
          <FormattedMessage
            id='domain.contact.tech'
            defaultMessage='Tehniline'
            tagName='strong'
          />
        ) : ('') }
      </Table.Cell>
      <Table.Cell>{ item.name }</Table.Cell>
      <Table.Cell>
        <a href={`mailto:${item.email}` }>{item.email}</a>
      </Table.Cell>
      <Table.Cell>{ item.phone || '-' }</Table.Cell>
    </Table.Row>
  ));
};

const mapStateToProps = (state, { match }) => {
  console.log('state change', state.domains.data[match.params.id]);
  return {
    domain: state.domains.data[match.params.id],
    contacts: state.contacts.data,
  };
};

export default connect(
  mapStateToProps,
  {
    ...domainsActions,
    ...contactsActions,
  }
)(DomainPage);
