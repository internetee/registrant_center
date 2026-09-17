/* eslint-disable */
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Form, Input, Container, Card, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
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
import { useParams } from 'react-router-dom';

const DomainEditPage = ({
    companies,
    contacts,
    domains,
    error,
    fetchCompanies,
    fetchDomain,
    isLoading,
    message,
    ui,
    updateContact,
    user,
}) => {
    const { id } = useParams();
    const domain = domains[id];
    const { uiElemSize } = ui;
    const [isDirty, setIsDirty] = useState([]);
    const [isSaving, setIsSaving] = useState([]);
    const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [stageData, setStageData] = useState({});
    useEffect(() => {
        (async () => {
            if ((!domain || !domain?.tech_contacts) && !isLoading && !error) {
                await fetchDomain(id);
                if (companies.isLoading === null) {
                    fetchCompanies();
                }
            }
        })();
    }, [domain, fetchDomain, isLoading, id, error]);

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

    useEffect(() => {
        if (message) {
            window.scrollTo(0, 0);
        }
    }, [message]);

    const handleChange = (e, id) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: {
                ...prevState[id],
                [name]: value,
            },
        }));
        if (!isDirty.includes(id)) {
            isDirty.push(id);
            setIsDirty(isDirty);
        }
    };

    const handleWhoIsChange = (data) => {
        setFormData({ ...formData, ...data });
        if (!isDirty.includes(Object.keys(data)[0])) {
            isDirty.push(Object.keys(data)[0]);
            setIsDirty(isDirty);
        }
    };

    const toggleSubmitConfirmModal = () => {
        setIsSubmitConfirmModalOpen(!isSubmitConfirmModalOpen);
    };

    const stageContactUpdate = (item) => {
        setStageData({ [item.id]: formData[item.id] });
        toggleSubmitConfirmModal();
    };
    const handleSubmit = async () => {
        if (!isSaving.includes(Object.keys(stageData)[0])) {
            isSaving.push(Object.keys(stageData)[0]);
            setIsSaving(isSaving);
        }
        setIsSubmitConfirmModalOpen(false);
        await Promise.all(
            Object.values(stageData).map((contact) => {
                const registrant = stageData[domain.registrant.id];
                const originalContact = contacts[contact.id];
                
                const newDisclosedAttributes = new Set(originalContact.disclosed_attributes);
                
                contact.disclosed_attributes.forEach(attr => {
                    if (!contact.system_disclosed_attributes || !contact.system_disclosed_attributes.includes(attr)) {
                        newDisclosedAttributes.add(attr);
                    }
                });

                if (contact.system_disclosed_attributes) {
                    contact.system_disclosed_attributes.forEach(attr => {
                        newDisclosedAttributes.add(attr);
                    });
                }

                if (registrant && registrant.ident.type === 'org') {
                    return updateContact(contact.id, {
                        email: contact.email,
                        phone: contact.phone,
                        disclosed_attributes: [...newDisclosedAttributes],
                        system_disclosed_attributes: contact.system_disclosed_attributes || []
                    });
                }
                if (contact.ident.code === user.ident) {
                    return updateContact(contact.id, {
                        disclosed_attributes: [...newDisclosedAttributes],
                        system_disclosed_attributes: contact.system_disclosed_attributes || [],
                        registrant_publishable: contact.registrant_publishable,
                        email: contact.email,
                        phone: contact.phone,
                    });
                }
                if (contact.ident.type === 'org') {
                    return updateContact(contact.id, {
                        email: contact.email,
                        phone: contact.phone,
                        disclosed_attributes: [...newDisclosedAttributes],
                        system_disclosed_attributes: contact.system_disclosed_attributes || []
                    });
                }
                return updateContact(contact.id, {
                    disclosed_attributes: [...newDisclosedAttributes],
                    system_disclosed_attributes: contact.system_disclosed_attributes || [],
                    registrant_publishable: contact.registrant_publishable,
                    email: contact.email,
                    phone: contact.phone,
                });
            })
        );
        if (isDirty.includes(Object.keys(stageData)[0])) {
            setIsDirty(isDirty.filter((r) => r !== Object.keys(stageData)[0]));
        }
        if (isSaving.includes(Object.keys(stageData)[0])) {
            setIsSaving(isSaving.filter((id) => id !== Object.keys(stageData)[0]));
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!domain || error) {
        return (
            <MainLayout hasBackButton titleKey="domain.404.title">
                <PageMessage
                    headerContent={<FormattedMessage id="domain.404.message.title" />}
                    icon="frown outline"
                >
                    <FormattedMessage id="domain.404.message.content" tagName="p" />
                </PageMessage>
            </MainLayout>
        );
    }

    return (
        <MainLayout hasBackButton title={domain.name}>
            <div className="page page--domain-edit">
                <div className="page--header">
                    <Container textAlign="center">
                        <h2>
                            <FormattedMessage id="domainEdit.title" tagName="label" />
                        </h2>
                    </Container>
                </div>
                <Grid textAlign="center">
                    <Grid.Row>
                        {Object.values(formData).map((item) => (
                            <Grid.Column
                                key={item.id}
                                computer={4}
                                mobile={16}
                                tablet={8}
                                widescreen={3}
                            >
                                <Card centered>
                                    <Card.Content>
                                        {!isSaving.includes(item.id) &&
                                            Object.keys(stageData).includes(item.id) &&
                                            message && (
                                                <MessageModule formMessage message={message} />
                                            )}
                                        <Form onSubmit={(_e) => stageContactUpdate(item)}>
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
                                                <Form.Field>
                                                    <FormattedMessage
                                                        id="domain.registrant.ident.code"
                                                        tagName="label"
                                                    />
                                                    <Input
                                                        defaultValue={item.ident.code}
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
                                                <FormattedMessage
                                                    id="domain.contactsVisibility"
                                                    tagName="h3"
                                                />
                                                <WhoIsEdit
                                                    checkAll
                                                    contacts={{ [item.id]: formData[item.id] }}
                                                    domain={domain}
                                                    onChange={handleWhoIsChange}
                                                />
                                            </>
                                            <div className="form-actions">
                                                <Button
                                                    disabled={!isDirty.includes(item.id)}
                                                    loading={isSaving.includes(item.id)}
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
                domain={domain}
                onCancel={toggleSubmitConfirmModal}
                onConfirm={handleSubmit}
                open={isSubmitConfirmModalOpen}
            />
        </MainLayout>
    );
};

const mapStateToProps = (state) => ({
    companies: state.companies,
    contacts: state.contacts.data,
    domains: state.domains.data,
    error: state.domains.error,
    isLoading: state.domains.isLoading,
    message: state.contacts.message,
    ui: state.ui,
    user: state.user.data,
});

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

DomainEditPage.propTypes = {
    companies: PropTypes.object,
    contacts: PropTypes.object,
    domain: PropTypes.object,
    fetchCompanies: PropTypes.func.isRequired,
    fetchDomain: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    ui: PropTypes.object.isRequired,
    updateContact: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
};

DomainEditPage.defaultProps = {
    companies: {},
    contacts: {},
    domains: {},
}
