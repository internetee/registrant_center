import React, { useState } from 'react';
import { Icon, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { WhoIsEdit } from '../../../components';

export default function Domain({ id, name, contacts, onChange, domains }) {
	const [isOpen, setIsOpen] = useState(false);

	let index = 0;
	// eslint-disable-next-line array-callback-return
	domains.find((o, i) => {
		if (o.id === id) index = i;
	});

	return (
		<Table.Row verticalAlign="top">
			<Table.Cell width={6}>
				<Link to={`/domain/${id}`}>{name}</Link>
			</Table.Cell>
			<Table.Cell width={8}>
				<div className="ui form">
					<WhoIsEdit
						checkAll
						contacts={contacts}
						domain={domains[index]}
						isOpen={isOpen}
						onChange={onChange}
					/>
				</div>
			</Table.Cell>
			<Table.Cell singleLine textAlign="right" width={2}>
				<button onClick={() => setIsOpen(!isOpen)} type="button">
					<FormattedMessage id="whois.domain.detailInfo" />
					<Icon
						className={classNames({ 'vertically flipped': isOpen })}
						name="angle down"
					/>
				</button>
			</Table.Cell>
		</Table.Row>
	);
}
