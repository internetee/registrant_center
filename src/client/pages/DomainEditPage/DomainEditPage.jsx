import React, {Component} from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Button, Form, Icon, Input, Container, Card, Confirm, Modal, List} from 'semantic-ui-react';
import { connect } from 'react-redux';
import {Helmet, WhoIsEdit, MessageModule, PageMessage, MainLayout} from '../../components';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';
import staticMessages from '../../utils/staticMessages';

class DomainEditPage extends Component {
  state = {
    isLoading: true,
    isSubmitConfirmModalOpen: false,
    contacts: null,
    message: null,
    errors: {},
    changedDomains: [],
    changedContacts: [],
    form: {}
  };
  
  componentDidMount() {
    const { user, initialDomains, initialContacts, match } = this.props;
    const domain = initialDomains.find(item => item.name.includes(match.params.id));
    const userContacts = Helpers.getUserContacts(user, domain, initialContacts.data);
    if (domain) {
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
        domain,
        contacts: userContacts
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
        domain: null,
        contacts: null
      }));
    }
    this.setState(prevState => ({
      ...prevState,
      errors: initialContacts.errors,
    }));
  }
  
  handleChange = (e, elem) => {
    const { initialContacts } = this.props;
    const { changedContacts, contacts } = this.state;
    const { name, value } = elem;
    const id = elem['data-id'];
    const editedContacts = changedContacts.slice();
    const contact = contacts.find(item => item.id === id);
    const initialContact = initialContacts.data.find(item => item.id === id);
    const changedContactIndex = editedContacts.findIndex(item => item.id === id);
    if (changedContactIndex > -1) {
      editedContacts[changedContactIndex] = {
        ...editedContacts[changedContactIndex],
        [name]: value
      };
      if ((editedContacts[changedContactIndex].email === initialContact.email) && (editedContacts[changedContactIndex].phone === initialContact.phone)) {
        editedContacts.splice(changedContactIndex, 1);
      }
    } else {
      editedContacts.push({
        ...contact,
        [name]: value
      });
    }
    this.setState(prevState => ({
      ...prevState,
      changedContacts: editedContacts
    }));
  };
  
  handleWhoIsChange = (data) => {
    const { initialContacts } = this.props;
    const { contacts, changedContacts } = this.state;
    const newContacts = contacts.slice();
    const initialContactsData = initialContacts.data;
    const editedContacts = changedContacts.slice();
    data.forEach(contact => {
      const contactIndex = contacts.findIndex(item => item.id === contact.id);
      const initialContact = initialContactsData.find(item => item.id === contact.id);
      const editedContactIndex = editedContacts.findIndex(item => item.id === contact.id);
      newContacts[contactIndex] = contact;
      if ([...contact.disclosed_attributes].sort().toString() !== [...initialContact.disclosed_attributes].sort().toString()) {
        if (editedContactIndex > -1) {
          editedContacts[editedContactIndex] = contact;
        } else {
          editedContacts.push(contact);
        }
      } else if (editedContactIndex > -1) {
        editedContacts.splice(editedContactIndex, 1);
      }
    });
    this.setState(prevState => ({
      ...prevState,
      contacts: newContacts,
      changedContacts: editedContacts
    }));
  };
  
  toggleSubmitConfirmModal = () => {
    const { contacts, changedContacts, isSubmitConfirmModalOpen } = this.state;
    const { initialDomains } = this.props;
    if (isSubmitConfirmModalOpen) {
      this.setState(prevState => ({
        ...prevState,
        isSubmitConfirmModalOpen: false,
        changedDomains: [],
        changedContacts: []
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        isSubmitConfirmModalOpen: true,
        changedDomains: Helpers.getChangedUserContactsByDomain(initialDomains, contacts, changedContacts)
      }));
    }
  };
  
  handleSubmit = async () => {
    const { user, initialContacts, setContacts } = this.props;
    const { contacts, changedContacts, domain } = this.state;
    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
      isSubmitConfirmModalOpen: false
    }));
    await Promise.all(changedContacts.map(contact => {
      let form = {};
      if (contact.ident.code === user.ident && contact.ident.type === 'org') {
        form = {
          email: contact.email,
          phone: contact.phone
        };
      }
      if (contact.ident.code === user.ident && contact.ident.type === 'priv') {
        form = {
          email: contact.email,
          phone: contact.phone,
          disclosed_attributes: [...contact.disclosed_attributes]
        };
      } else {
        form = {
          disclosed_attributes: [...contact.disclosed_attributes]
        };
      }
      return setContacts(contact.id, form);
    }));
    this.setState(prevState => ({
      ...prevState,
      isLoading: false,
      contacts: Helpers.getUserContacts(user, domain, contacts),
      changedDomains: [],
      changedContacts: [],
      message: {
        code: initialContacts.status,
        type: 'whois',
      },
    }));
  };
  
  render() {
    const { ui, user, match, history } = this.props;
    const { contacts, changedContacts, changedDomains, isSubmitConfirmModalOpen, isLoading, message, errors } = this.state;
    const { uiElemSize, lang } = ui;
    
    const Roles = ({ roles }) => {
      return [...roles].map((role, i) => {
        const { domain } = staticMessages[lang];
        if (i === roles.size - 1) {
          return domain[role];
        }
        if (i === roles.size - 2) {
          return `${domain[role]} & `;
        }
        return `${domain[role]}, `;
      });
    };

    if (contacts) {
      const isUserNameDifferent = new Set(contacts.map(item => item.name)).size > 1;
      return (
        <MainLayout ui={ui} user={user}>
          <FormattedMessage
            id="domain.page_title"
            defaultMessage='{domainName} | EIS Registreerijaportaal'
            values={{
              domainName: match.params.id
            }}
          >
            {title => (
              <Helmet>
                <title>{title}</title>
              </Helmet>
            )}
          </FormattedMessage>
          <div className='main-hero'>
            <FormattedMessage
              id='domain_edit.title'
              defaultMessage='Kontaktide muutmine'
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
          <div className='page page--domain-edit'>
            <div className='page--header'>
              <Container textAlign='center'>
                <h2>
                  { user.name }
                </h2>
              </Container>
            </div>
            <Card centered>
              <Card.Content>
                { !isLoading && message && <MessageModule message={message} lang={lang} formMessage /> }
                <Form onSubmit={this.toggleSubmitConfirmModal}>
                  { !isUserNameDifferent && (
                    <Form.Field>
                      <FormattedMessage
                        id='domain.registrant.name'
                        defaultMessage='Nimi'
                        tagName='label'
                      />
                      <Input size={ uiElemSize } type='text' disabled defaultValue={ contacts[0].name } />
                    </Form.Field>
                  ) }
                  <Form.Field>
                    <FormattedMessage
                      id='domain.registrant.ident.code'
                      defaultMessage='Isikukood'
                      tagName='label'
                    />
                    <Input size={ uiElemSize } type='text' disabled defaultValue={ user.ident }/>
                  </Form.Field>
                  { contacts.map(item => (
                    <Form.Group grouped key={item.id}>
                      <h4>
                        <FormattedHTMLMessage
                          id="domain.role"
                          defaultMessage="Roll: "
                          tagName="span"
                        />
                        <Roles roles={item.roles} />
                      </h4>
                      { isUserNameDifferent && (
                        <Form.Field>
                          <FormattedMessage
                            id='domain.registrant.name'
                            defaultMessage='Nimi'
                            tagName='label'
                          />
                          <Input size={ uiElemSize } type='text' disabled defaultValue={ item.name } />
                        </Form.Field>
                      )}
                      <Form.Field error={errors && errors.email && errors.email.length}>
                        <FormattedMessage
                          id='domain.registrant.email'
                          defaultMessage='E-mail'
                          tagName='label'
                        />
                        <Input size={ uiElemSize } type='email' name='email' defaultValue={ item.email } data-id={item.id} onChange={ this.handleChange } required />
                      </Form.Field>
                      <Form.Field error={errors && errors.phone && errors.phone.length}>
                        <FormattedMessage
                          id='domain.registrant.phone'
                          defaultMessage='Telefon'
                          tagName='label'
                        />
                        <Input size={ uiElemSize } type='tel' name='phone' defaultValue={ item.phone } data-id={item.id} onChange={ this.handleChange } required />
                      </Form.Field>
                    </Form.Group>
                  )) }
                  <FormattedMessage
                    id='domain.contacts_visibility'
                    defaultMessage='Kontaktide nähtavus'
                    tagName='h3'
                  />
                  <WhoIsEdit user={user} contacts={contacts} lang={lang} checkAll handleWhoIsChange={this.handleWhoIsChange} />
                  <div className='form-actions'>
                    <Button primary size={ uiElemSize } type='submit' loading={isLoading} disabled={changedContacts.length === 0}>
                      <FormattedMessage
                        id='domain.contacts.save'
                        defaultMessage='Salvesta'
                        tagName='span'
                      />
                    </Button>
                  </div>
                </Form>
              </Card.Content>
            </Card>
          </div>
          <Confirm
            size='large'
            open={isSubmitConfirmModalOpen}
            closeOnEscape
            onConfirm={this.handleSubmit}
            onCancel={this.toggleSubmitConfirmModal}
            header={
              <Modal.Header>
                <FormattedMessage
                  id='whois.confirm_modal.title'
                  defaultMessage='Kas oled kindel, et soovid kontaktandmeid muuta?'
                  tagName='h2'
                />
              </Modal.Header>
            }
            content={
              <Modal.Content className='center'>
                <FormattedMessage
                  id='whois.confirm_modal.description.title'
                  defaultMessage='Teie muudatused kajastuvad järgmiste domeenide puhul:'
                  tagName='h3'
                />
                <List divided relaxed size='small' className='changed-domains-list'>
                  { changedDomains.map(item => (
                    <List.Item key={Math.random()}>
                      <List.Content>
                        <List.Header as='a' href={`/domain/${encodeURIComponent(item.name)}`} target='_blank'>
                          { item.name }
                        </List.Header>
                        <List.Description>
                          <FormattedMessage
                            id='whois.confirm_modal.description.roles'
                            defaultMessage='Roll: '
                            tagName='strong'
                          />
                          <Roles roles={item.roles} />
                        </List.Description>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Modal.Content>
            }
            confirmButton={
              <Button data-test="change-contacts" primary size={ uiElemSize }>
                <FormattedMessage
                  id='whois.confirm_modal.confirm'
                  defaultMessage='Jah'
                  tagName='span'
                />
              </Button>
            }
            cancelButton={
              <Button data-test="close-change-contacts-modal" secondary size={ uiElemSize }>
                <FormattedMessage
                  id='whois.confirm_modal.submicancel'
                  defaultMessage='Ei'
                  tagName='span'
                />
              </Button>
            }
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

const mapStateToProps = (state) => {
  return {
    initialDomains: state.domains.data,
    initialContacts: state.contacts,
  };
};



export default connect(
  mapStateToProps,
  {
    ...contactsActions
  },
)(DomainEditPage);