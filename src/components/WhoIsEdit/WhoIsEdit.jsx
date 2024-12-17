/* eslint-disable camelcase */
import { Fragment, forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Checkbox, Popup, Icon } from 'semantic-ui-react';
// import PropTypes from 'prop-types';
import Roles from '../Roles/Roles';

function WhoIsEdit({ contacts, isOpen, checkAll, onChange, domain }) {
    const contactsList = Object.values(contacts);
    const isCompany =
        contactsList.find(({ ident }) => ident.type === 'org' || domain.registrant.org) != null;

    const { totalCount, isCheckedAll, checkedCount } = contactsList.reduce(
        (acc, { ident, disclosed_attributes }) => ({
            checkedCount:
                acc.checkedCount +
                // eslint-disable-next-line func-names
                (function () {
                    if (domain.registrant.org) {
                        return 2;
                    }
                    if (ident.type === 'org') {
                        return 2;
                    }
                    return disclosed_attributes.size;
                })(),
            isCheckedAll: disclosed_attributes.size === contactsList.length * 3,
            totalCount: acc.totalCount + 3,
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
            const { registrant_publishable } = contacts[id];
            const attributes = new Set(disclosed_attributes);
            let publishable = registrant_publishable;

            if (domain.registrant.org) {
                attributes.add('name');
                attributes.add('email');
            }

            type.forEach((attr) => {
                if (attr === 'registrant_publishable') {
                    publishable = checked;
                } else if (checked) {
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
                    registrant_publishable: publishable,
                },
            };
        }, {});
        onChange(changedContacts);
    };

    const CheckAllLabel = forwardRef((props, ref) => {
        const message = indeterminate 
            ? "whois.edit.checkSome"
            : isCheckedAll 
                ? "whois.edit.checkAll" 
                : "whois.edit.checkNone";

        return (
            <label ref={ref}>
                <FormattedMessage
                    id={message}
                    values={{
                        count: checkedCount,
                        countOf: totalCount,
                    }}
                />
            </label>
        );
    });

    if (!contactsList.length) {
        return null;
    }

    return (
        <>
            {checkAll && !isCompany && (
                <Form.Field>
                    <Checkbox
                        checked={isCheckedAll}
                        className="large"
                        indeterminate={indeterminate}
                        label={<CheckAllLabel />}
                        onChange={(e, elem) => {
                            handleChange(elem.checked, Object.keys(contacts), [
                                'name',
                                'email',
                                'phone',
                            ]);
                        }}
                    />
                </Form.Field>
            )}
            <Form.Group
                className={isOpen ? 'adv-field-group u-visible' : 'adv-field-group'}
                grouped
            >
                {contactsList.map((item) => (
                    <Fragment key={item.id}>
                        <div className="contact-role-label">
                            <FormattedMessage id="domain.role" tagName="strong" />
                            <strong>
                                <Roles roles={item.roles} />
                            </strong>
                        </div>
                        <Form.Field>
                            <Checkbox
                                id={`name-${item.id}`}
                                checked={
                                    domain.registrant.org ||
                                    item.ident.type === 'org' ||
                                    item.disclosed_attributes.has('name')
                                }
                                disabled={item.ident.type === 'org' || domain.registrant.org}
                                label={
                                    <label htmlFor={`name-${item.id}`}>
                                        <FormattedMessage
                                            id="whois.edit.name"
                                            values={{
                                                contactName: item.initialName,
                                            }}
                                        />
                                    </label>
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
                                id={`email-${item.id}`}
                                checked={
                                    domain.registrant.org ||
                                    item.ident.type === 'org' ||
                                    item.disclosed_attributes.has('email')
                                }
                                disabled={item.ident.type === 'org' || domain.registrant.org}
                                label={
                                    <label htmlFor={`email-${item.id}`}>
                                        <FormattedMessage
                                            id="whois.edit.email"
                                            values={{
                                                contactEmail: item.initialEmail,
                                            }}
                                        />
                                    </label>
                                }
                                name="email"
                                onChange={(e, elem) =>
                                    handleChange(elem.checked, [item.id], ['email'])
                                }
                                value={item.email}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                id={`phone-${item.id}`}
                                checked={item.disclosed_attributes.has('phone')}
                                label={
                                    <label htmlFor={`phone-${item.id}`}>
                                        <FormattedMessage
                                            id="whois.edit.phone"
                                            values={{
                                                contactPhone: item.initialPhone,
                                            }}
                                        />
                                    </label>
                                }
                                name="phone"
                                onChange={(e, elem) =>
                                    handleChange(elem.checked, [item.id], ['phone'])
                                }
                                value={item.phone}
                            />
                        </Form.Field>
                        <div className="whois-public-label">
                            <FormattedMessage id="whois.public.text" tagName="strong" />
                            <Popup basic inverted trigger={<Icon name="question circle" />}>
                                <FormattedMessage id="whois.public.tooltip" />
                            </Popup>
                        </div>
                        <Form.Field>
                            <Checkbox
                                id={`publishable-${item.id}`}
                                checked={item.registrant_publishable}
                                label={
                                    <label htmlFor={`publishable-${item.id}`}>
                                        <FormattedMessage
                                            id="whois.edit.registrant_publishable"
                                        />
                                    </label>
                                }
                                name="registrant_publishable"
                                onChange={(e, elem) =>
                                    handleChange(
                                        elem.checked,
                                        [item.id],
                                        ['registrant_publishable']
                                    )
                                }
                            />
                        </Form.Field>
                    </Fragment>
                ))}
            </Form.Group>
        </>
    );
}

export default WhoIsEdit;

// WhoIsEdit.propTypes = {
//     isOpen: PropTypes.bool,
//     checkAll: PropTypes.bool,
//     onChange: PropTypes.func,
//     contacts: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
//     domain: PropTypes.object.isRequired,
// };

// WhoIsEdit.defaultProps = {
//     isOpen: false,
//     checkAll: false,
//     onChange: () => {},
//     contacts: [],
// };
