/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Button, Form, Icon, Input, Container, Card} from 'semantic-ui-react';
import { connect } from 'react-redux';
import {
  Helmet,
  WhoIsEdit,
  MessageModule,
  PageMessage,
  Roles,
  MainLayout,
  WhoIsConfirmDialog,
  Loading
} from '../../components';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

const DomainEditPage = ({ contacts, domain, fetchContacts, message, ui, updateContact, user, match, history }) => {
  const { uiElemSize, lang } = ui;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (domain) {
      (async () => {
        await Promise.all(Object.keys(domain.contacts).map(id => fetchContacts(id)));
        setIsLoading(false);
      })();
    }
  }, [domain]);

  useEffect(() => {
    if (domain) {
      // setErrors(contacts.errors);
      setFormData(Helpers.getUserContacts(user, domain, contacts));
    }
  }, [contacts, domain, user]);

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        [name]: value
      }
    }));
    setIsDirty(true);
  };

  const handleWhoIsChange = (data) => {
    setFormData(data);
    setIsDirty(true);
  };

  const toggleSubmitConfirmModal = () => {
    setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setIsSubmitConfirmModalOpen(false);
    await Promise.all(Object.values(formData).map(contact => {
      let values;
      if (contact.ident.code === user.ident && contact.ident.type === 'org') {
        values = {
          email: contact.email,
          phone: contact.phone
        };
      } else if (contact.ident.code === user.ident && contact.ident.type === 'priv') {
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
      return updateContact(contact.id, values);
    }));
    setIsDirty(false);
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

  const isUserNameDifferent = new Set(Object.values(formData).map(item => item.name)).size > 1;

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
            { !isSaving && message && <MessageModule message={message} lang={lang} formMessage /> }
            <Form onSubmit={toggleSubmitConfirmModal}>
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
              { Object.values(formData).map(item => (
                <Form.Group grouped key={item.id}>
                  <h4>
                    <FormattedHTMLMessage
                      id="domain.role"
                      defaultMessage="Roll: "
                      tagName="span"
                    />
                    <Roles lang={lang} roles={item.roles} />
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
                  <Form.Field error={message && message.errors && message.errors.email && message.errors.email.length}>
                    <FormattedMessage
                      id='domain.registrant.email'
                      defaultMessage='E-mail'
                      tagName='label'
                    />
                    <Input size={ uiElemSize } type='email' name='email' defaultValue={item.email} onChange={(e) => handleChange(e, item.id) } required />
                  </Form.Field>
                  <Form.Field error={message && message.errors && message.errors.phone && message.errors.phone.length}>
                    <FormattedMessage
                      id='domain.registrant.phone'
                      defaultMessage='Telefon'
                      tagName='label'
                    />
                    <Input size={ uiElemSize } type='tel' name='phone' defaultValue={item.phone} onChange={(e) => handleChange(e, item.id) } required />
                  </Form.Field>
                </Form.Group>
              )) }
              <FormattedMessage
                id='domain.contacts_visibility'
                defaultMessage='Kontaktide nähtavus'
                tagName='h3'
              />
              <WhoIsEdit user={user} contacts={formData} lang={lang} checkAll onChange={handleWhoIsChange} />
              <div className='form-actions'>
                <Button primary size={ uiElemSize } type='submit' loading={isSaving} disabled={!isDirty}>
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
        contacts={formData}
        onCancel={toggleSubmitConfirmModal}
        onConfirm={handleSubmit}
        open={isSubmitConfirmModalOpen}
      />
    </MainLayout>
  );
};

const mapStateToProps = (state, { match }) => {
  return {
    message: state.contacts.message,
    contacts: state.contacts.data,
    domain: state.domains.data[match.params.id],
  };
};



export default connect(
  mapStateToProps,
  {
    ...contactsActions
  },
)(DomainEditPage);
