import React, { useState } from 'react';
import { Icon, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { WhoIsEdit } from '../../../components';

export default function Domain({ name, contacts, lang, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Table.Row verticalAlign="top">
      <Table.Cell width={6}>
        <Link to={`/domain/${name}`}>{name}</Link>
      </Table.Cell>
      <Table.Cell width={8}>
        <div className="ui form">
          <WhoIsEdit
            contacts={contacts}
            lang={lang}
            checkAll
            isOpen={isOpen}
            onChange={onChange}
          />
        </div>
      </Table.Cell>
      <Table.Cell textAlign="right" singleLine width={2}>
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
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
