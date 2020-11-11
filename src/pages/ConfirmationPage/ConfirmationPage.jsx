/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Button,
    Container,
    Table,
} from 'semantic-ui-react';
import { connect } from 'react-redux';

import { Loading, MainLayout, PageMessage, MessageModule } from '../../components';
import { fetchDomainRegistrantUpdate as fetchDomainRegistrantUpdateAction } from '../../redux/reducers/verification';
import { respondToVerification as respondToVerificationAction } from '../../redux/reducers/verification';
import { bindActionCreators } from 'redux';

const ConfirmationPage = ({ match, ui, message, fetchDomainRegistrantUpdate, respondToVerification, verification }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { uiElemSize } = ui;

    const handleVerification = async (shouldConfirm) => {
        setIsLoading(true);
        await respondToVerification(match.params.name, match.params.token, shouldConfirm);
        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await fetchDomainRegistrantUpdate({ domain: match.params.name, token: match.params.token });
            setIsLoading(false);
        })();
    }, [fetchDomainRegistrantUpdate]);

    if (isLoading) return <Loading />;

    return (
        <MainLayout hasBackButton titleKey="confirmation.title">
            {!isLoading && message && <MessageModule message={message} />}
            <div className="page page--whois">
                {verification.domainName != null ? (
                    <>
                        {isLoading || false ? (
                            <>
                                {isLoading && <Loading />}
                                {!isLoading && false && (
                                    <PageMessage
                                        headerContent={
                                            <FormattedMessage
                                                id="whois.search.message.title"
                                                tagName="span"
                                            />
                                        }
                                    />
                                )}
                            </>
                        ) : (
                                verification.status == null ? (
                                    <div className="page--whosis">
                                        <div className="page--header">
                                            <Container textAlign="center">
                                                <div>
                                                    <h2>{verification.domainName}</h2>
                                                    <p><FormattedMessage id="confirmation.default_alt" /></p>
                                                </div>
                                            </Container>
                                        </div>
                                        <div className="page--block">
                                            <Container text>
                                                <header className="page--block--header">
                                                    <h2>
                                                        <FormattedMessage id="confirmation.new_registrant" />
                                                    </h2>
                                                </header>
                                                <Table basic="very">
                                                    <Table.Body>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.registrar.name"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>{verification.newRegistrant.name}</Table.Cell>
                                                        </Table.Row>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.registrant.ident"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {verification.newRegistrant.ident}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.contact.country"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {verification.newRegistrant.country}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    </Table.Body>
                                                </Table>
                                            </Container>
                                        </div>
                                        <div className="page--block">
                                            <Container text>
                                                <header className="page--block--header">
                                                    <h2>
                                                        <FormattedMessage id="confirmation.current_registrant" />
                                                    </h2>
                                                </header>
                                                <Table basic="very">
                                                    <Table.Body>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.registrar.name"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>{verification.currentRegistrant.name}</Table.Cell>
                                                        </Table.Row>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.registrant.ident"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {verification.currentRegistrant.ident}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                        <Table.Row>
                                                            <Table.Cell width="4">
                                                                <FormattedMessage
                                                                    id="domain.contact.country"
                                                                    tagName="strong"
                                                                />
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {verification.currentRegistrant.country}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    </Table.Body>
                                                </Table>
                                            </Container>
                                        </div>
                                        <div className="page--block">
                                            <Container textAlign="center">
                                                <div className="page--header--actions">
                                                    <Button
                                                        data-test="link-domain-edit"
                                                        onClick={() => handleVerification('rejected')}
                                                        secondary
                                                        size={uiElemSize}
                                                        disabled={isLoading}
                                                        loading={isLoading}
                                                    >
                                                        <FormattedMessage id="confirmation.reject" />
                                                    </Button>
                                                    <Button
                                                        data-test="link-domain-edit"
                                                        onClick={() => handleVerification('confirmed')}
                                                        primary
                                                        size={uiElemSize}
                                                        disabled={isLoading}
                                                        loading={isLoading}
                                                    >
                                                        <FormattedMessage id="confirmation.confirm" />
                                                    </Button>
                                                </div>
                                            </Container>
                                        </div>
                                    </div>
                                ) : (
                                        <div className="page--whosis">
                                            <div className="page--header">
                                                <Container textAlign="center">
                                                    <div>
                                                        <h2>{verification.domainName}</h2>
                                                        <p><FormattedMessage id={verification.status === 'confirmed' ? 'confirmation.confirmed_alt' : 'confirmation.rejected_alt'} /></p>
                                                    </div>
                                                </Container>
                                            </div>
                                            <div className="page--block">
                                                <Container text>
                                                    <header className="page--block--header">
                                                        <h2>
                                                            <FormattedMessage id="confirmation.valid_registrant" />
                                                        </h2>
                                                    </header>
                                                    <Table basic="very">
                                                        <Table.Body>
                                                            <Table.Row>
                                                                <Table.Cell width="4">
                                                                    <FormattedMessage
                                                                        id="domain.registrar.name"
                                                                        tagName="strong"
                                                                    />
                                                                </Table.Cell>
                                                                <Table.Cell>{verification.currentRegistrant.name}</Table.Cell>
                                                            </Table.Row>
                                                            <Table.Row>
                                                                <Table.Cell width="4">
                                                                    <FormattedMessage
                                                                        id="domain.registrant.ident"
                                                                        tagName="strong"
                                                                    />
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {verification.currentRegistrant.ident}
                                                                </Table.Cell>
                                                            </Table.Row>
                                                            <Table.Row>
                                                                <Table.Cell width="4">
                                                                    <FormattedMessage
                                                                        id="domain.contact.country"
                                                                        tagName="strong"
                                                                    />
                                                                </Table.Cell>
                                                                <Table.Cell>
                                                                    {verification.currentRegistrant.country}
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        </Table.Body>
                                                    </Table>
                                                </Container>
                                            </div>
                                        </div>
                                    ))

                        }
                    </>
                ) : (
                        <PageMessage
                            headerContent={<FormattedMessage id="confirmation.not_available" />}
                            icon="frown outline"
                        />
                    )}
            </div>
        </MainLayout>
    );
};

export default connect(
    (state) => (state),
    dispatch => bindActionCreators({ fetchDomainRegistrantUpdate: fetchDomainRegistrantUpdateAction, respondToVerification: respondToVerificationAction }, dispatch)
)(ConfirmationPage)