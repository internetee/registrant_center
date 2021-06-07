import { Button, Confirm, List, Modal } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as contactsActions from '../../redux/reducers/contacts';
import Helpers from '../../utils/helpers';

function WhoIsConfirmDialog({ contacts, domains, onConfirm, onCancel, open, ui }) {
	const changedDomains = Helpers.getChangedUserContactsByDomain(domains.domains, contacts);
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
										href={`/domain/${encodeURIComponent(item.id)}`}
										target="_blank"
									>
										{item.name}
									</List.Header>
								</List.Content>
							</List.Item>
						))}
					</List>

					{changedDomains.length > 10 && (
						<FormattedMessage id="whois.confirmModal.not_full_list" tagName="p" />
					)}
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

WhoIsConfirmDialog.propTypes = {
	contacts: PropTypes.object.isRequired,
	domains: PropTypes.object.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	open: PropTypes.bool.isRequired,
	ui: PropTypes.object.isRequired,
};
