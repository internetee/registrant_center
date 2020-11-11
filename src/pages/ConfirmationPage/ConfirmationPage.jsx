/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Button,
    Container,
    Table,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { Loading, MainLayout, PageMessage, MessageModule } from '../../components';
import { fetchDomainRegistrantUpdate as fetchDomainRegistrantUpdateAction } from '../../redux/reducers/verification';
import { respondToVerification as respondToVerificationAction } from '../../redux/reducers/verification';
import { bindActionCreators } from 'redux';

const ConfirmationPage = ({ match, ui, message, fetchDomainRegistrantUpdate, domain, verification }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { uiElemSize } = ui;
    const [isSaving, setIsSaving] = useState(false);

    const handleVerification = async (shouldConfirm) => {
        console.log("launching");
        setIsSaving(true);
        await respondToVerificationAction(match.params.name, match.params.token, shouldConfirm);
        setIsSaving(false);
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await fetchDomainRegistrantUpdate({domain: match.params.name, token: match.params.token});
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
                                <div className="page--whosis">
                                    <div className="page--header">
                                        <Container textAlign="center">
                                            <div>
                                                <h2>Domeeni {verification.domainName} omanikuvahetus</h2>
                                                <p>Oleme saanud avalduse domeeni omanikuvahetuse jaoks. Kui kõik tundub õige, palun kinnitage avaldus.</p>
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
                                                </Table.Body>
                                            </Table>
                                        </Container>
                                    </div>
                                    <div className="page--block">
                                        <Container textAlign="center">
                                            <div className="page--header--actions">
                                                <Button
                                                    content='Lükka tagasi'
                                                    data-test="link-domain-edit"
                                                    onClick={() => handleVerification('reject')}
                                                    secondary
                                                    size={uiElemSize}
                                                    disabled={isSaving}
                                                    loading={isSaving}
                                                />
                                                <Button
                                                    content='Kinnita avaldus'
                                                    data-test="link-domain-edit"
                                                    onClick={() => handleVerification('confirm')}
                                                    primary
                                                    size={uiElemSize}
                                                    disabled={isSaving}
                                                    loading={isSaving}
                                                />
                                            </div>
                                        </Container>
                                    </div>
                                </div>

                            )}
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
    dispatch => bindActionCreators({fetchDomainRegistrantUpdate: fetchDomainRegistrantUpdateAction, respondToVerification: respondToVerificationAction}, dispatch)
  )(ConfirmationPage)