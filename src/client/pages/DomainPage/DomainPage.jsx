/* eslint-disable camelcase */
import React, {Component} from 'react';
import { FormattedMessage} from 'react-intl';
import {Popup, Button, Form, Icon, Label, Container, Table, Modal, Confirm} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Helmet, Loading, WhoIsEdit, MessageModule, PageMessage, MainLayout, WhoIsConfirmDialog } from '../../components';
import domainStatuses from '../../utils/domainStatuses.json';
import * as domainsActions from '../../redux/reducers/domains';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

class DomainPage extends Component {
  
  state = {
    isDirty: false,
    isLocked: null,
    isLockable: null,
    isLoading: true,
    isSubmitConfirmModalOpen: false,
    setLockModalOpen: false,
    deleteLockModalOpen: false,
    tableCellWidth: '4',
    domain: null,
    contacts: [],
    userContacts: {},
    message: null,
    errors: {},
    changedDomains: [],
  };
  
  componentDidMount() {
    const { fetchContacts, initialDomains, initialContacts, match, user } = this.props;
    const domain = initialDomains.data.find(item => item.name.indexOf(match.params.id) > -1);
    if (domain) {
      (async () => {
        const { admin_contacts, registrant, tech_contacts } = domain;
        const res = await Promise.all([...new Set([...admin_contacts, registrant, ...tech_contacts].map(({ id }) => id))].map(id => fetchContacts(id)));
        const contacts = res[0].ids.map(id => res[0].data[id]);
        const statuses = domain.statuses.sort((a, b) => domainStatuses[a].priority - domainStatuses[b].priority);
        this.setState(prevState => ({
          ...prevState,
          isLocked: domain.locked_by_registrant_at && ['serverUpdateProhibited', 'serverDeleteProhibited', 'serverTransferProhibited'].every(r => statuses.includes(r)),
          isLoading: false,
          isLockable: ['pendingDelete', 'serverHold'].every(status => statuses.indexOf(status) < 0),
          domain,
          contacts: Helpers.getDomainContacts(domain, contacts),
          userContacts: Helpers.getUserContacts(user, domain, contacts)
        }));
      })();
    }
    this.setState(prevState => ({
      ...prevState,
      isLoading: false,
      errors: initialContacts.errors
    }));
  }

  handleWhoIsChange = (data) => {
    this.setState(prevState => ({
      ...prevState,
      userContacts: Object.entries(data).reduce((acc, [id, { disclosed_attributes }]) => ({
        ...acc,
        [id]: {
          ...prevState.userContacts[id],
          disclosed_attributes
        }
      }), {}),
      isDirty: true
    }));
  };
  
  handleWhoIsSubmit = async () => {
    const { setContacts, initialContacts } = this.props;
    const { userContacts } = this.state;
    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
      isSubmitConfirmModalOpen: false
    }));
    await Promise.all(Object.values(userContacts).map(contact => {
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
  
  
  toggleSubmitConfirmModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isSubmitConfirmModalOpen: !prevState.isSubmitConfirmModalOpen,
    }));
  };
  
  toggleSetLockModal = () => {
    this.setState(prevState => ({
      ...prevState,
      setLockModalOpen: !prevState.setLockModalOpen
    }));
  };
  
  toggleDeleteLockModal = () => {
    this.setState(prevState => ({
      ...prevState,
      deleteLockModalOpen: !prevState.deleteLockModalOpen
    }));
  };
  
  lockDomain = async (uuid) => {
    const { lockDomain, match } = this.props;
    this.setState(prevState => ({
      ...prevState,
      setLockModalOpen: !prevState.setLockModalOpen,
      isLoading: true,
      message: null
    }));
    try {
      const initialDomains = await lockDomain(uuid);
      const domain = initialDomains.data.find(item => item.name.includes(match.params.id));
      this.setState(prevState => ({
        ...prevState,
        domain,
        message: {
          code: initialDomains.status,
          type: 'domain_lock'
        },
        isLocked: true,
        isLoading: false
      }));
    } catch (error) {
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
        message: {
          type: 'domain_lock',
          code: 500
        }
      }));
      console.log(error); // eslint-disable-line no-console
    }
  };
  
  unlockDomain = async (uuid) => {
    const { unlockDomain, match } = this.props;
    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
      deleteLockModalOpen: !prevState.deleteLockModalOpen,
      message: null
    }));
    try {
      const initialDomains = await unlockDomain(uuid);
      const domain = initialDomains.data.find(item => item.name.includes(match.params.id));
      this.setState(prevState => ({
        ...prevState,
        domain,
        message: {
          code: initialDomains.status,
          type: 'domain_unlock'
        },
        isLocked: false,
        isLoading: false
      }));
    } catch (error) {
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
        message: {
          type: 'domain_unlock',
          code: 500
        }
      }));
      console.log(error); // eslint-disable-line no-console
    }
  };
  
  render() {
    const { isDirty, domain, setLockModalOpen, deleteLockModalOpen, tableCellWidth, contacts,
      userContacts, isLoading, isLocked, isLockable, isSubmitConfirmModalOpen, message } = this.state;
    const { initialDomains, ui, match, user, history } = this.props;
    const { uiElemSize, lang } = ui;
    const canUserLockDomain = Object.values(userContacts).some(item => item.roles.has('registrant') || item.roles.has('admin'));
    if (isLoading && !domain) {
      return <Loading/>;
    }
    if (domain) {
      const registrantContacts = contacts.find(item => item.roles.has('registrant'));
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
          { !isLoading && message && <MessageModule message={message} lang={lang} /> }
          <div className='page page--domain'>
            <div className='page--header'>
              <Container textAlign='center'>
                <div className="page--header--actions">
                  <Button data-test='link-domain-edit' as={Link} primary size={ uiElemSize } to={`/domain/${domain.name}/edit`} content='Muuda kontakte'/>
                  { (isLockable && canUserLockDomain) && (
                    <React.Fragment>
                      { isLocked ? (
                        <Button data-test='open-unlock-modal' primary size={ uiElemSize } disabled={isLoading} loading={isLoading} onClick={this.toggleDeleteLockModal}>
                          <FormattedMessage
                            id='domain.unlock'
                            defaultMessage='Vabasta'
                          />
                        </Button>
                      ) : (
                        <Button data-test='open-lock-modal' primary size={ uiElemSize } disabled={isLoading} loading={isLoading} onClick={this.toggleSetLockModal}>
                          <FormattedMessage
                            id='domain.lock'
                            defaultMessage='Lukusta'
                          />
                        </Button>
                      )}
                    </React.Fragment>
                  )}
                </div>
              </Container>
            </div>
            { isLoading ? (
              <Loading/>
            ) : (
              <React.Fragment>
                {registrantContacts ? (
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
                      <Table basic='very'>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell width={tableCellWidth}>
                              <FormattedMessage
                                id='domain.registrant.name'
                                defaultMessage='Nimi'
                                tagName='strong'
                              />
                            </Table.Cell>
                            <Table.Cell>{registrantContacts.name} ({ registrantContacts.code })</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell width={tableCellWidth}>
                              <FormattedMessage
                                id='domain.registrant.ident'
                                defaultMessage='Isikukood'
                                tagName='strong'
                              />
                            </Table.Cell>
                            <Table.Cell>{registrantContacts.ident.code}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell width={tableCellWidth}>
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
                          <Table.Row>
                            <Table.Cell width={tableCellWidth}>
                              <FormattedMessage
                                id='domain.registrant.phone'
                                defaultMessage='Telefon'
                                tagName='strong'
                              />
                            </Table.Cell>
                            <Table.Cell>{registrantContacts.phone}</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Container>
                  </div>
                ) : (
                  null
                )}
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
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        <DomainContacts type="tech" contacts={ domain.tech_contacts } />
                        <DomainContacts type="admin" contacts={ domain.admin_contacts } />
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
                          <Table.Cell width={tableCellWidth}>
                            <FormattedMessage
                              id='domain.registrar.name'
                              defaultMessage='Nimi'
                              tagName='strong'
                            />
                          </Table.Cell>
                          <Table.Cell>{ domain.registrar.name }</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                          <Table.Cell width={tableCellWidth}>
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
                    <Form onSubmit={this.toggleSubmitConfirmModal}>
                      <WhoIsEdit user={user} contacts={userContacts} lang={lang} handleWhoIsChange={this.handleWhoIsChange} />
                      <div className='form-actions'>
                        <Button type='submit' primary size={ uiElemSize } disabled={!isDirty}>
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
              </React.Fragment>
            )}
          </div>
          <Confirm
            size='large'
            open={setLockModalOpen}
            closeOnEscape
            onConfirm={() => this.lockDomain(domain.id)}
            onCancel={this.toggleSetLockModal}
            header={
              <Modal.Header>
                <FormattedMessage
                  id='domain.lock.title'
                  defaultMessage='Kas oled kindel, et soovid domeeni lukustada?'
                  tagName='h2'
                />
              </Modal.Header>
            }
            content={
              <Modal.Content className='center'>
                <FormattedMessage
                  id='domain.lock.description'
                  defaultMessage='Sellisel juhul võimalikud vaid serveri poolsed muudatused seni kuni pole lukku eemaldatud. Kõik registripidaja poolsed toimingud va domeeni pikendamine on keelatud.'
                  tagName='p'
                />
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
          <Confirm
            size='large'
            open={deleteLockModalOpen}
            closeOnEscape
            onConfirm={() => this.unlockDomain(domain.id)}
            onCancel={this.toggleDeleteLockModal}
            header={
              <Modal.Header>
                <FormattedMessage
                  id='domain.unlock.title'
                  defaultMessage='Kas oled kindel, et soovid domeeni vabastada?'
                  tagName='h2'
                />
              </Modal.Header>
            }
            content={
              <Modal.Content className='center'>
                <FormattedMessage
                  id='domain.unlock.description'
                  defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque dicta earum harum, inventore itaque maiores nemo nobis porro quasi rem repellendus repudiandae saepe sequi voluptas voluptates? Deleniti facere illum suscipit.'
                  tagName='p'
                />
              </Modal.Content>
            }
            confirmButton={
              <Button data-test='unlock-domain' primary size={ uiElemSize }>
                <FormattedMessage
                  id='domain.unlock.yes'
                  defaultMessage='Jah'
                  tagName='span'
                />
              </Button>
            }
            cancelButton={
              <Button data-test='close-unlock-modal' secondary size={ uiElemSize }>
                <FormattedMessage
                  id='domain.unlock.no'
                  defaultMessage='Ei'
                  tagName='span'
                />
              </Button>
            }
          />
          <WhoIsConfirmDialog
            changedDomains={Helpers.getChangedUserContactsByDomain(initialDomains.data, contacts)}
            onCancel={this.toggleSubmitConfirmModal}
            onConfirm={this.handleWhoIsSubmit}
            open={isSubmitConfirmModalOpen}
            ui={ui}
          />
        </MainLayout>
      );
    }
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
}

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
    </Table.Row>
  ));
};

const mapStateToProps = (state) => ({
  initialDomains: state.domains,
  initialContacts: state.contacts,
});

export default connect(
  mapStateToProps,
  {
    ...domainsActions,
    ...contactsActions,
  }
)(DomainPage);
