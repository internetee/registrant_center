/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Form, Input, Container, Card, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    WhoIsEdit,
    MessageModule,
    PageMessage,
    Roles,
    MainLayout,
    WhoIsConfirmDialog,
    Loading,
} from '../../components';
import Helpers from '../../utils/helpers';
import { fetchDomain as fetchDomainAction } from '../../redux/reducers/domains';
import { fetchCompanies as fetchCompaniesAction } from '../../redux/reducers/companies';
import { updateContact as updateContactAction } from '../../redux/reducers/contacts';

const DomainEditPage = ({
    companies,
    contacts,
    domain,
    fetchCompanies,
    fetchDomain,
    isLoading,
    match,
    message,
    ui,
    updateContact,
    user,
}) => {
    const { uiElemSize } = ui;
    const [isDirty, setIsDirty] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [stageData, setStageData] = useState({});

    useEffect(() => {
        (async () => {
            if ((!domain || domain?.shouldFetchContacts) && !isLoading) {
                await fetchDomain(match.params.id);
            }
        })();
    }, [domain, fetchDomain, isLoading, match]);

    useEffect(() => {
        if (domain) {
            const registrant = contacts[domain.registrant.id];
            if (registrant && registrant.ident.type === 'org') {
                if (companies.isLoading === null) {
                    (async () => {
                        await fetchCompanies();
                    })();
                }
            }
            setFormData(Helpers.parseDomainContacts(user, domain, contacts, companies.data));
        }
    }, [companies, contacts, domain, fetchCompanies, user]);

    const handleChange = (e, id) => {
        console.log(formData);
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                [name]: value,
            },
        }));
        if(!isDirty.includes(id)) {
            isDirty.push(id);
            setIsDirty(isDirty);
        }
    };

    const handleWhoIsChange = (data) => {
        setFormData(data);
    };

    const toggleSubmitConfirmModal = () => {
        setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
    };

    const stageContactUpdate = (item) => {
        var stageData = { [item.id]: formData[item.id] }
        setStageData(stageData);
        toggleSubmitConfirmModal();
    }
    const handleSubmit = async () => {
        setIsSaving(true);
        setIsSubmitConfirmModalOpen(false);
        await Promise.all(
            Object.values(stageData).map((contact) => {
                const registrant = stageData[domain.registrant.id];
                if (registrant && registrant.ident.type === 'org') {
                    return updateContact(contact.id, {
                        email: contact.email,
                        phone: contact.phone,
                    });
                }
                if (contact.ident.code === user.ident) {
                    return updateContact(contact.id, {
                        disclosed_attributes: [...contact.disclosed_attributes],
                        email: contact.email,
                        phone: contact.phone,
                    });
                }
                return updateContact(contact.id, {
                    disclosed_attributes: [...contact.disclosed_attributes],
                });
            })
        );
        setIsDirty(false);
        setIsSaving(false);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!domain) {
        return (
            <MainLayout hasBackButton titleKey="domain.404.title">
                <PageMessage
                    headerContent={<FormattedMessage id="domain.404.message.title" />}
                    icon="frown outline"
                >
                    <FormattedMessage id="domain.none.message.text" tagName="p" />
                </PageMessage>
            </MainLayout>
        );
    }

    return (
        <MainLayout hasBackButton title={domain.name}>
            <div className="page page--domain-edit">
                <div className="page--header">
                    <Container textAlign="center">
                        <h2><FormattedMessage id="domainEdit.title" tagName="label" /></h2>
                    </Container>
                </div>
                <Grid textAlign="center">
                        <Grid.Row>
                        {Object.values(formData).map((item) => (
                            <Grid.Column key={item.id} computer={4} mobile={8} tablet={8} widescreen={3}>
                            <Card centered>
                    <Card.Content>
                        {!isSaving && message && <MessageModule formMessage message={message} />}
                        <Form onSubmit={e => stageContactUpdate(item)}>
                                <Form.Group grouped>
                                    <h4>
                                        <Roles roles={item.roles} />
                                    </h4>
                                        <Form.Field>
                                            <FormattedMessage
                                                id="domain.registrant.name"
                                                tagName="label"
                                            />
                                            <Input
                                                defaultValue={item.name}
                                                disabled
                                                size={uiElemSize}
                                                type="text"
                                            />
                                        </Form.Field>
                                    <Form.Field
                                        error={
                                            message &&
                                            message.errors &&
                                            message.errors.email &&
                                            message.errors.email.length
                                        }
                                    >
                                        <FormattedMessage
                                            id="domain.registrant.email"
                                            tagName="label"
                                        />
                                        <Input
                                            defaultValue={item.email}
                                            name="email"
                                            onChange={(e) => handleChange(e, item.id)}
                                            required
                                            size={uiElemSize}
                                            type="email"
                                        />
                                    </Form.Field>
                                    <Form.Field
                                        error={
                                            message &&
                                            message.errors &&
                                            message.errors.phone &&
                                            message.errors.phone.length
                                        }
                                    >
                                        <FormattedMessage
                                            id="domain.registrant.phone"
                                            tagName="label"
                                        />
                                        <Input
                                            defaultValue={item.phone}
                                            name="phone"
                                            onChange={(e) => handleChange(e, item.id)}
                                            required
                                            size={uiElemSize}
                                            type="tel"
                                        />
                                    </Form.Field>
                                </Form.Group>
                                <>
                                    <FormattedMessage id="domain.contactsVisibility" tagName="h3" />
                                    <WhoIsEdit
                                        contacts={{[item.id]: formData[item.id]}}
                                        onChange={handleWhoIsChange}
                                    />
                                </>
                            <div className="form-actions">
                                <Button
                                    disabled={!isDirty.includes(item.id)}
                                    loading={isSaving}
                                    primary
                                    size={uiElemSize}
                                    type="submit"
                                >
                                    <FormattedMessage
                                        defaultMessage="Salvesta"
                                        id="actions.save"
                                        tagName="span"
                                    />
                                </Button>
                            </div>
                        </Form>
                    </Card.Content>
                </Card>
                            </Grid.Column>
                        ))}
                        </Grid.Row>
                    </Grid>
            </div>
            <WhoIsConfirmDialog
                contacts={stageData}
                onCancel={toggleSubmitConfirmModal}
                onConfirm={handleSubmit}
                open={isSubmitConfirmModalOpen}
            />
        </MainLayout>
    );
};

const mapStateToProps = (state, { match }) => {
    return {
        companies: state.companies,
        contacts: state.contacts.data,
        domain: state.domains.data[match.params.id],
        isLoading: state.domains.isLoading,
        message: state.contacts.message,
        ui: state.ui,
        user: state.user.data,
    };
};

const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
        {
            fetchCompanies: fetchCompaniesAction,
            fetchDomain: fetchDomainAction,
            updateContact: updateContactAction,
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(DomainEditPage);
