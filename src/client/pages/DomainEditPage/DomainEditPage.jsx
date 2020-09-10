/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import {FormattedMessage} from 'react-intl';
import {Button, Form, Input, Container, Card} from 'semantic-ui-react';
import { connect } from 'react-redux';
import {
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

const DomainEditPage = ({ contacts, domain, fetchContacts, message, ui, updateContact, user }) => {
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
      <MainLayout hasBackButton titleKey="domain.404.title" ui={ui} user={user}>
        <PageMessage
          headerContent={(
            <FormattedMessage
              id="domain.404.message.title"
            />
          )}
          icon="frown outline"
        >
          <FormattedMessage
            id='domain.none.message.text'
            tagName='p'
          />
        </PageMessage>
      </MainLayout>
    );
  }

  const isUserNameDifferent = new Set(Object.values(formData).map(item => item.name)).size > 1;

  return (
    <MainLayout hasBackButton title={domain.name} ui={ui} user={user}>
      <div className='page page--domain-edit'>
        <div className='page--header'>
          <Container textAlign='center'>
            <h2>
              {user.name}
            </h2>
          </Container>
        </div>
        <Card centered>
          <Card.Content>
            {!isSaving && message && <MessageModule message={message} formMessage />}
            <Form onSubmit={toggleSubmitConfirmModal}>
              { !isUserNameDifferent && (
                <Form.Field>
                  <FormattedMessage
                    id='domain.registrant.name'
                    tagName='label'
                  />
                  <Input size={ uiElemSize } type='text' disabled defaultValue={ user.name } />
                </Form.Field>
              ) }
              <Form.Field>
                <FormattedMessage
                  id='domain.registrant.ident.code'
                  tagName='label'
                />
                <Input size={ uiElemSize } type='text' disabled defaultValue={ user.ident }/>
              </Form.Field>
              { Object.values(formData).map(item => (
                <Form.Group grouped key={item.id}>
                  <h4>
                    <FormattedMessage
                      id="domain.role"
                    />
                    <Roles lang={lang} roles={item.roles} />
                  </h4>
                  { isUserNameDifferent && (
                    <Form.Field>
                      <FormattedMessage
                        id='domain.registrant.name'
                        tagName='label'
                      />
                      <Input size={ uiElemSize } type='text' disabled defaultValue={ item.name } />
                    </Form.Field>
                  )}
                  <Form.Field error={message && message.errors && message.errors.email && message.errors.email.length}>
                    <FormattedMessage
                      id='domain.registrant.email'
                      tagName='label'
                    />
                    <Input size={ uiElemSize } type='email' name='email' defaultValue={item.email} onChange={(e) => handleChange(e, item.id) } required />
                  </Form.Field>
                  <Form.Field error={message && message.errors && message.errors.phone && message.errors.phone.length}>
                    <FormattedMessage
                      id='domain.registrant.phone'
                      tagName='label'
                    />
                    <Input size={ uiElemSize } type='tel' name='phone' defaultValue={item.phone} onChange={(e) => handleChange(e, item.id) } required />
                  </Form.Field>
                </Form.Group>
              )) }
              <FormattedMessage
                id='domain.contactsVisibility'
                tagName='h3'
              />
              <WhoIsEdit user={user} contacts={formData} lang={lang} checkAll onChange={handleWhoIsChange} />
              <div className='form-actions'>
                <Button primary size={ uiElemSize } type='submit' loading={isSaving} disabled={!isDirty}>
                  <FormattedMessage
                    id='actions.save'
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
