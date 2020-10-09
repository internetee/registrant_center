/* eslint-disable camelcase */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Checkbox } from 'semantic-ui-react';
import Roles from '../Roles/Roles';

function WhoIsEdit({ contacts, isOpen, checkAll, onChange }) {
    const contactsList = Object.values(contacts);
    const { totalCount, isCheckedAll, checkedCount } = contactsList.reduce(
        (acc, { disclosed_attributes }) => ({
            checkedCount: acc.checkedCount + disclosed_attributes.size,
            isCheckedAll: acc.isCheckedAll + disclosed_attributes.size === acc.totalCount + 2,
            totalCount: acc.totalCount + 2,
        }),
        {
            checkedCount: 0,
            isCheckedAll: false,
            totalCount: 0,
        }
    );

    const indeterminate = checkedCount > 0 && checkedCount < totalCount;

    const handleChange = (checked, ids, type) => {
        const changedContacts = ids.reduce((acc, id) => {
            const { disclosed_attributes } = contacts[id];
            const attributes = new Set(disclosed_attributes);
            type.forEach((attr) => {
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
                    disclosed_attributes: attributes,
                },
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
                        countOf: totalCount,
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
                        countOf: totalCount,
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
                    countOf: totalCount,
                }}
            />
        );
    };

    return (
        <>
            {checkAll && (
                <Form.Field>
                    <Checkbox
                        checked={isCheckedAll}
                        className="large"
                        indeterminate={indeterminate}
                        label={<CheckAllLabel />}
                        onChange={(e, elem) =>
                            handleChange(elem.checked, Object.keys(contacts), ['name', 'email'])
                        }
                    />
                </Form.Field>
            )}
            <Form.Group
                className={isOpen ? 'adv-field-group u-visible' : 'adv-field-group'}
                grouped
            >
                {contactsList.map((item) => (
                    <React.Fragment key={item.id}>
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label htmlFor={item.id}>
                            <FormattedMessage id="domain.role" tagName="strong" />
                            <strong>
                                <Roles roles={item.roles} />
                            </strong>
                        </label>
                        <Form.Field>
                            <Checkbox
                                checked={item.disclosed_attributes.has('name')}
                                label={
                                    <FormattedMessage
                                        id="whois.edit.name"
                                        tagName="label"
                                        values={{
                                            contactName: item.initialName,
                                        }}
                                    />
                                }
                                name="name"
                                onChange={(e, elem) =>
                                    handleChange(elem.checked, [item.id], ['name'])
                                }
                                value={item.name}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                checked={item.disclosed_attributes.has('email')}
                                label={
                                    <FormattedMessage
                                        id="whois.edit.email"
                                        tagName="label"
                                        values={{
                                            contactEmail: item.initialEmail,
                                        }}
                                    />
                                }
                                name="email"
                                onChange={(e, elem) =>
                                    handleChange(elem.checked, [item.id], ['email'])
                                }
                                value={item.email}
                            />
                        </Form.Field>
                    </React.Fragment>
                ))}
            </Form.Group>
        </>
    );
}

export default WhoIsEdit;
