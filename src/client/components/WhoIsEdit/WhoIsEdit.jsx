import React from 'react';
import PropTypes from 'prop-types';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Form, Checkbox } from 'semantic-ui-react';
import staticMessages from '../../utils/staticMessages';

function WhoIsEdit({ contacts, isOpen, checkAll, lang, handleWhoIsChange }) {
  const totalCount = contacts.reduce((cnt) => cnt + 2, 0);
  const isCheckedAll = contacts.reduce((cnt, el) => cnt + el.disclosed_attributes.size, 0) === totalCount;
  const checkedCount = contacts.reduce((cnt, el) => cnt + el.disclosed_attributes.size, 0);
  const indeterminate = checkedCount > 0 && checkedCount < totalCount;
  
  const CheckAllLabel = () => {
    if (indeterminate) {
      return (
        <FormattedMessage
          id="whois.edit.check_some"
          defaultMessage="({ count }/{ countOf }) Osa info peidetud"
          tagName="label"
          values={{
            count: checkedCount,
            countOf: totalCount
          }}
        />
      );
    }
    if (isCheckedAll) {
      return (
        <FormattedMessage
          id="whois.edit.check_all"
          defaultMessage="({ count }/{ countOf }) Kõik info nähtav"
          tagName="label"
          values={{
            count: checkedCount,
            countOf: totalCount
          }}
        />
      );
    }
    return (
      <FormattedMessage
        id="whois.edit.check_none"
        defaultMessage="({ count }/{ countOf }) Kõik info peidetud"
        tagName="label"
        values={{
          count: checkedCount,
          countOf: totalCount
        }}
      />
    );
  };
  
  const onChange = (checked, ids, type) => {
    const changedContacts = [...contacts];
    changedContacts.forEach(item => {
      if (ids.includes(item.id)) {
        if (checked) {
          type.forEach(attr => {
            item.disclosed_attributes.add(attr);
          });
        } else {
          type.forEach(attr => {
            item.disclosed_attributes.delete(attr);
          });
        }
      }
    });
    handleWhoIsChange(changedContacts);
  };
  
  const Roles = ({ roles }) => {
    return [...roles].map((role, i) => {
      const { domain } = staticMessages[lang];
      if (i === roles.size - 1) {
        return domain[role];
      }
      if (i === roles.size - 2) {
        return `${domain[role]} & `;
      }
      return `${domain[role]}, `;
    });
  };
  
  return (
    <React.Fragment>
      { checkAll && (
        <Form.Field>
          <Checkbox
            className='large'
            checked={isCheckedAll}
            indeterminate={indeterminate}
            label={<CheckAllLabel />}
            onChange={(e, elem) => onChange(elem.checked,[...new Set(contacts.map(item => item.id))],['name', 'email'])}
          />
        </Form.Field>
      )}
      <Form.Group grouped className={ isOpen ? 'adv-field-group u-visible' : 'adv-field-group' }>
        { contacts.map(item => (
          <React.Fragment key={item.id}>
            <label htmlFor={item.id}>
              <FormattedHTMLMessage
                id="domain.role"
                defaultMessage="Roll: "
                tagName="strong"
              />
              <strong>
                <Roles roles={item.roles} />
              </strong>
            </label>
            <Form.Field>
              <Checkbox
                name='name'
                checked={item.disclosed_attributes.has('name')}
                value={item.name}
                label={<FormattedMessage
                  id="whois.edit.name"
                  defaultMessage="Nimi avalik ({ contactName })"
                  tagName="label"
                  values={{
                    contactName: item.name
                  }}
                />}
                onChange={(e, elem) => onChange(elem.checked,[item.id],['name'])}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                name='email'
                checked={item.disclosed_attributes.has('email')}
                value={item.email}
                label={<FormattedMessage
                  id="whois.edit.email"
                  defaultMessage="E-mail avalik ({ contactEmail })"
                  tagName="label"
                  values={{
                    contactEmail: item.email
                  }}
                />}
                onChange={(e, elem) => onChange(elem.checked,[item.id],['email'])}
              />
            </Form.Field>
          </React.Fragment>
        ))}
      </Form.Group>
    </React.Fragment>
  );
}

WhoIsEdit.propTypes = {
  isOpen: PropTypes.bool,
  checkAll: PropTypes.bool,
};

WhoIsEdit.defaultProps = {
  isOpen: null,
  checkAll: null,
};

export default WhoIsEdit;