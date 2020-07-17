/* eslint-disable camelcase */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Checkbox } from 'semantic-ui-react';
import { Roles } from '..';

function WhoIsEdit({ contacts, isOpen, checkAll, lang, onChange }) {
  const contactsList = Object.values(contacts);
  const { totalCount, isCheckedAll, checkedCount } = contactsList.reduce((acc, { disclosed_attributes }) => ({
    checkedCount: acc.checkedCount + disclosed_attributes.size,
    isCheckedAll: acc.isCheckedAll + disclosed_attributes.size === acc.totalCount + 2,
    totalCount: acc.totalCount + 2,
  }), {
    checkedCount: 0,
    isCheckedAll: false,
    totalCount: 0,
  });
  
  const indeterminate = checkedCount > 0 && checkedCount < totalCount;

  const handleChange = (checked, ids, type) => {
    const changedContacts = ids.reduce((acc, id) => {
      const { disclosed_attributes } = contacts[id];
      const attributes = new Set(disclosed_attributes);
      type.forEach(attr => {
        if (checked) {
          attributes.add(attr);
        } else {
          attributes.delete(attr);
        }
      });
      return {
        ...acc,
        [id]: {
          ...contacts[id],
          disclosed_attributes: attributes
        }
      };
      
    }, {});
    onChange(changedContacts);
  };


  const CheckAllLabel = () => {
    if (indeterminate) {
      return (
        <FormattedMessage
          id="whois.edit.checkSome"
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
          id="whois.edit.checkAll"
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
        id="whois.edit.checkNone"
        tagName="label"
        values={{
          count: checkedCount,
          countOf: totalCount
        }}
      />
    );
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
            onChange={(e, elem) => handleChange(elem.checked, Object.keys(contacts),['name', 'email'])}
          />
        </Form.Field>
      )}
      <Form.Group grouped className={ isOpen ? 'adv-field-group u-visible' : 'adv-field-group' }>
        { contactsList.map(item => (
          <React.Fragment key={item.id}>
            <label htmlFor={item.id}>
              <FormattedMessage
                id="domain.role"
                tagName="strong"
              />
              <strong>
                <Roles lang={lang} roles={item.roles} />
              </strong>
            </label>
            <Form.Field>
              <Checkbox
                name='name'
                checked={item.disclosed_attributes.has('name')}
                value={item.name}
                label={<FormattedMessage
                  id="whois.edit.name"
                  tagName="label"
                  values={{
                    contactName: item.initialName
                  }}
                />}
                onChange={(e, elem) => handleChange(elem.checked,[item.id],['name'])}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                name='email'
                checked={item.disclosed_attributes.has('email')}
                value={item.email}
                label={<FormattedMessage
                  id="whois.edit.email"
                  tagName="label"
                  values={{
                    contactEmail: item.initialEmail
                  }}
                />}
                onChange={(e, elem) => handleChange(elem.checked,[item.id],['email'])}
              />
            </Form.Field>
          </React.Fragment>
        ))}
      </Form.Group>
    </React.Fragment>
  );
}

export default WhoIsEdit;
