import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Container, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { Loading, MainLayout, PageMessage, MessageModule } from '../../components';
import {
    fetchVerification as fetchVerificationAction,
    respondToVerification as respondToVerificationAction,
} from '../../redux/reducers/verification';
import { useParams } from 'react-router-dom';
import { should } from 'vitest';

const ConfirmationPage = ({
    ui,
    message,
    fetchVerification,
    respondToVerification,
    verification,
}) => {
    const { name, type, token } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const { uiElemSize } = ui;

    if (!name || !type) {
        return (
            <MainLayout titleKey="errorpage.title">
                <div className="page">
                    <PageMessage
                        headerContent={<FormattedMessage id="errorpage.none.message.title" />}
                        icon="times circle outline"
                    />
                </div>
            </MainLayout>
        );
    }

    const headerAltText = () => {
        let str = '';
        if (type === 'change') {
            if (verification.status === 'confirmed') {
                str = 'confirmation.change_confirmed_alt';
            } else {
                str = 'confirmation.change_rejected_alt';
            }
        } else if (type === 'delete') {
            if (verification.status === 'confirmed') {
                str = 'confirmation.delete_confirmed_alt';
            } else {
                str = 'confirmation.delete_confirmed_alt';
            }
        }

        return str;
    };

    const handleVerification = async (shouldConfirm) => {
        setIsLoading(true);
        await respondToVerification(
            name,
            token,
            shouldConfirm,
            type
        );
        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            if (!token) {
                // If no token, just show the form without fetching
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            await fetchVerification({
                domain: name,
                token: token,
                type: type,
            });
            setIsLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchVerification]);

    if (isLoading) return <Loading />;

    return (
        <MainLayout
            hasBackButton
            titleKey={
                type === 'change'
                    ? 'confirmation.change_title'
                    : 'confirmation.delete_title'
            }
        >
            {!isLoading && message && <MessageModule message={message} />}
            <div className="page page--whois">
                {verification.domainName != null ? (
                    <>
                        {verification.status == null ? (
                            <div className="page--whosis">
                                <div className="page--header">
                                    <Container textAlign="center">
                                        <div>
                                            <h2>{verification.domainName}</h2>
                                            <p>
                                                <FormattedMessage
                                                    id={
                                                        type === 'change'
                                                            ? 'confirmation.change_default_alt'
                                                            : 'confirmation.delete_default_alt'
                                                    }
                                                />
                                            </p>
                                        </div>
                                    </Container>
                                </div>
                                {type === 'change' ? (
                                    <div className="page--block">
                                        {' '}
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
                                                        <Table.Cell>
                                                            {verification.newRegistrant.name}
                                                        </Table.Cell>
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
                                ) : null}
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
                                                    <Table.Cell>
                                                        {verification.currentRegistrant.name}
                                                    </Table.Cell>
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
                                                data-test="reject"
                                                disabled={isLoading}
                                                loading={isLoading}
                                                onClick={() => handleVerification('rejected')}
                                                secondary
                                                size={uiElemSize}
                                            >
                                                <FormattedMessage id="confirmation.reject" />
                                            </Button>
                                            <Button
                                                data-test="confirm"
                                                disabled={isLoading}
                                                loading={isLoading}
                                                onClick={() => handleVerification('confirmed')}
                                                primary
                                                size={uiElemSize}
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
                                            <p>
                                                <FormattedMessage id={headerAltText()} />
                                            </p>
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
                                                    <Table.Cell>
                                                        {verification.currentRegistrant.name}
                                                    </Table.Cell>
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
                        )}
                    </>
                ) : (
                    <PageMessage
                        headerContent={
                            <FormattedMessage
                                id={
                                    type === 'change'
                                        ? 'confirmation.change_not_available'
                                        : 'confirmation.delete_not_available'
                                }
                            />
                        }
                        icon="frown outline"
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default connect(
    (state) => ({
        ui: state.ui,
        message: state.message,
        verification: state.verification,
    }),
    (dispatch) =>
        bindActionCreators(
            {
                fetchVerification: fetchVerificationAction,
                respondToVerification: respondToVerificationAction,
            },
            dispatch
        )
)(ConfirmationPage);

ConfirmationPage.propTypes = {
    ui: PropTypes.object.isRequired,
    message: PropTypes.string,
    fetchVerification: PropTypes.func.isRequired,
    verification: PropTypes.object.isRequired,
};

ConfirmationPage.defaultProps = {
    message: '',
};
