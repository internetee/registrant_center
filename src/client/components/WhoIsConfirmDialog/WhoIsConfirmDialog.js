import { Button, Confirm, List, Modal } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { connect } from 'react-redux';
import staticMessages from '../../utils/staticMessages.json';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

function WhoIsConfirmDialog({
  contacts,
  domains,
  onConfirm,
  onCancel,
  open,
  ui
}) {
  const changedDomains = Helpers.getChangedUserContactsByDomain(
    domains,
    contacts
  );
  const { uiElemSize, lang } = ui;
  const Roles = item => {
    return [...item.roles].map((role, i) => {
      const { domain } = staticMessages[lang];
      if (i === item.roles.size - 1) {
        return domain[role];
      }
      if (i === item.roles.size - 2) {
        return `${domain[role]} & `;
      }
      return `${domain[role]}, `;
    });
  };

  return (
    <Confirm
      size="large"
      open={open}
      closeOnEscape
      onConfirm={onConfirm}
      onCancel={onCancel}
      header={
        <Modal.Header>
          <FormattedMessage id="whois.confirmModal.title" tagName="h2" />
        </Modal.Header>
      }
      content={
        <Modal.Content className="center">
          <FormattedMessage
            id="whois.confirmModal.description.title"
            tagName="h3"
          />
          <List divided relaxed size="small" className="changed-domains-list">
            {changedDomains.map(item => (
              <List.Item key={Math.random()}>
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
      confirmButton={
        <Button data-test="change-contacts" primary size={uiElemSize}>
          <FormattedMessage id="actions.confirm.yes" defaultMessage="Jah" />
        </Button>
      }
      cancelButton={
        <Button
          data-test="close-change-contacts-modal"
          secondary
          size={uiElemSize}
        >
          <FormattedMessage id="actions.confirm.no" defaultMessage="Ei" />
        </Button>
      }
    />
  );
}

const mapStateToProps = state => {
  return {
    domains: state.domains.data,
    ui: state.ui
  };
};

export default connect(mapStateToProps, {
  ...contactsActions
})(WhoIsConfirmDialog);
