/* eslint-disable camelcase */
import React, { Component } from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Button, Form, Icon, Input, Container, Card} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Helmet, WhoIsEdit, MessageModule, PageMessage, MainLayout, WhoIsConfirmDialog } from '../../components';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';
import staticMessages from '../../utils/staticMessages.json';

class DomainEditPage extends Component {
  state = {
    isDirty: false,
    isLoading: true,
    isSubmitConfirmModalOpen: false,
    contacts: {},
    message: null,
    errors: {},
    form: {}
  };
  
  componentDidMount() {
    const { user, initialDomains, initialContacts, match } = this.props;
    const domain = initialDomains.find(item => item.name.includes(match.params.id));
    if (domain) {
      const userContacts = Helpers.getUserContacts(user, domain, initialContacts.data);
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
        domain: domain || null,
        contacts: domain ? userContacts : null
      }));
    }
    this.setState(prevState => ({
      ...prevState,
      errors: initialContacts.errors,
    }));
  }
  
  handleChange = (e, id) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      ...prevState,
      contacts: {
        ...prevState.contacts,
        [id]: {
          ...prevState.contacts[id],
          [name]: value
        }
      },
      isDirty: true,
    }));
  };
  
  handleWhoIsChange = (data) => {
    this.setState(prevState => ({
      ...prevState,
      contacts: Object.entries(data).reduce((acc, [id, { disclosed_attributes }]) => ({
        ...acc,
        [id]: {
          ...prevState.contacts[id],
          disclosed_attributes
        }
      }), {}),
      isDirty: true
    }));
  };
  
  toggleSubmitConfirmModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isSubmitConfirmModalOpen: !prevState.isSubmitConfirmModalOpen,
    }));
  };
  
  handleSubmit = async () => {
    const { user, initialContacts, setContacts } = this.props;
    const { contacts } = this.state;
    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
      isSubmitConfirmModalOpen: false
    }));
    await Promise.all(Object.values(contacts).map(contact => {
      let values = {};
      if (contact.ident.code === user.ident && contact.ident.type === 'org') {
        values = {
          email: contact.email,
          phone: contact.phone
        };
      }
      if (contact.ident.code === user.ident && contact.ident.type === 'priv') {
        values = {
          email: contact.email,
          phone: contact.phone,
          disclosed_attributes: [...contact.disclosed_attributes]
        };
      } else {
        values = {
          disclosed_attributes: [...contact.disclosed_attributes]
        };
      }
      return setContacts(contact.id, values);
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
    const { initialDomains, ui, user, match, history } = this.props;
    const { contacts, isDirty, isSubmitConfirmModalOpen, isLoading, message, errors } = this.state;
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
      const contactsList = Object.values(contacts);
      const isUserNameDifferent = new Set(contactsList.map(item => item.name)).size > 1;
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
                      <Input size={ uiElemSize } type='text' disabled defaultValue={ user.name } />
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
                  { contactsList.map(item => (
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
                        <Input size={ uiElemSize } type='email' name='email' defaultValue={item.email} onChange={(e) => this.handleChange(e, item.id) } required />
                      </Form.Field>
                      <Form.Field error={errors && errors.phone && errors.phone.length}>
                        <FormattedMessage
                          id='domain.registrant.phone'
                          defaultMessage='Telefon'
                          tagName='label'
                        />
                        <Input size={ uiElemSize } type='tel' name='phone' defaultValue={item.phone} onChange={(e) => this.handleChange(e, item.id) } required />
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
                    <Button primary size={ uiElemSize } type='submit' loading={isLoading} disabled={!isDirty}>
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
          <WhoIsConfirmDialog
            changedDomains={Helpers.getChangedUserContactsByDomain(initialDomains, contactsList)}
            onCancel={this.toggleSubmitConfirmModal}
            onConfirm={this.handleSubmit}
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
