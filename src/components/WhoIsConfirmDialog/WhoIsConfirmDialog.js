import { Button, Confirm, List, Modal } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { connect } from 'react-redux';

import Roles from '../Roles/Roles';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

function WhoIsConfirmDialog({ contacts, domains, onConfirm, onCancel, open, ui }) {
    const changedDomains = Helpers.getChangedUserContactsByDomain(domains.domains, contacts) || [];
    const { uiElemSize } = ui;

    return (
        <Confirm
            cancelButton={
                <Button data-test="close-change-contacts-modal" secondary size={uiElemSize}>
                    <FormattedMessage defaultMessage="Ei" id="actions.confirm.no" />
                </Button>
            }
            closeOnEscape
            confirmButton={
                <Button data-test="change-contacts" primary size={uiElemSize}>
                    <FormattedMessage defaultMessage="Jah" id="actions.confirm.yes" />
                </Button>
            }
            content={
                <Modal.Content className="center">
                    <FormattedMessage id="whois.confirmModal.description.title" tagName="h3" />
                    <List className="changed-domains-list" divided relaxed size="small">
                        {changedDomains.map((item) => (
                            <List.Item key={item.id}>
                                <List.Content>
                                    <List.Header
                                        as="a"
                                        href={`/domain/${encodeURIComponent(item.name)}`}
                                        target="_blank"
                                    >
                                        {item.name}
                                    </List.Header>
                                    <List.Description>
                                        <FormattedMessage
                                            id="whois.confirm_modal.description.roles"
                                            tagName="strong"
                                        />
                                        <Roles roles={item.roles} />
                                    </List.Description>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </Modal.Content>
            }
            header={
                <Modal.Header>
                    <FormattedMessage id="whois.confirmModal.title" tagName="h2" />
                </Modal.Header>
            }
            onCancel={onCancel}
            onConfirm={onConfirm}
            open={open}
            size="large"
        />
    );
}

const mapStateToProps = (state) => {
    return {
        domains: state.domains.data,
        ui: state.ui,
    };
};

export default connect(mapStateToProps, {
    ...contactsActions,
})(WhoIsConfirmDialog);
