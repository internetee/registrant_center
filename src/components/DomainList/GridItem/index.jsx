import React, { useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Icon, Label, Table, Transition } from 'semantic-ui-react';
import moment from 'moment';

import PropTypes from 'prop-types';

import 'moment/locale/et';
import 'moment/locale/ru';
import domainStatuses from '../../../utils/domainStatuses.json';

const DomainGridItem = ({ domain, lang }) => {
    moment.locale(lang);
    const { formatMessage } = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const [showStatuses, setShowStatuses] = useState(false);

    const handleExtra = () => {
        setIsOpen((prevState) => !prevState);
        setShowStatuses((prevState) => !prevState);
    };

    const handleStatuses = () => {
        setShowStatuses((prevState) => !prevState);
    };

    if (domain) {
        return (
            <article className={classNames('domains-grid--item', { 'is-open': isOpen })}>
                <div className="container">
                    <div className="content">
                        <Link className="link" to={`/domain/${domain.id}`}>
                            <h2>{domain.name}</h2>
                        </Link>
                        <p>
                            {domain.registrar && domain.registrar.website ? (
                                <a
                                    href={
                                        domain.registrar.website.indexOf('http') > -1
                                            ? domain.registrar.website
                                            : `http://${domain.registrar.website}`
                                    }
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {domain.registrar.name}
                                </a>
                            ) : (
                                '-'
                            )}
                        </p>
                        <Label.Group className="statuses" size="large">
                            {domain.statuses.map((status, i) => (
                                <Label
                                    key={status}
                                    basic
                                    circular
                                    className={classNames({ hidden: !showStatuses && i > 0 })}
                                    color={domainStatuses[status].color}
                                    title={formatMessage({
                                        id: `domain.status.${status}.description`,
                                    })}
                                >
                                    <Icon name="circle" />
                                    <FormattedMessage
                                        id={`domain.status.${status}`}
                                        tagName="span"
                                    />
                                </Label>
                            ))}
                            <Label
                                as="a"
                                circular
                                className={classNames({ hidden: domain.statuses.length < 2 })}
                                color="black"
                                onClick={handleStatuses}
                                role="button"
                            >
                                {domain.statuses.length > 1 &&
                                    (showStatuses
                                        ? `-${domain.statuses.length - 1}`
                                        : `+${domain.statuses.length - 1}`)}
                            </Label>
                        </Label.Group>
                        <Transition
                            animation={isOpen ? 'slide down' : 'slide down'}
                            duration={300}
                            unmountOnHide
                            visible={isOpen}
                        >
                            <div className="extra">
                                <h5>
                                    <FormattedMessage id="domain.registrant" />
                                </h5>
                                <div className="table-wrap">
                                    <Table basic="very" compact size="small" unstackable>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>
                                                    <FormattedMessage
                                                        id="domain.registrant.name"
                                                        tagName="strong"
                                                    />
                                                </Table.HeaderCell>
                                                <Table.HeaderCell>
                                                    <FormattedMessage
                                                        id="domain.registrant.email"
                                                        tagName="strong"
                                                    />
                                                </Table.HeaderCell>
                                                <Table.HeaderCell>
                                                    <FormattedMessage
                                                        id="domain.registrant.phone"
                                                        tagName="strong"
                                                    />
                                                </Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            <DomainRegistrant contact={domain.registrant} />
                                        </Table.Body>
                                    </Table>
                                </div>
                            </div>
                        </Transition>
                        <div className="data">
                            {domain.valid_to && (
                                <FormattedMessage
                                    id="domains.domain.validTo"
                                    tagName="p"
                                    values={{
                                        strong: (text) => <strong>{text}</strong>,
                                        valid_to: moment(domain.valid_to).format('DD.MM.Y HH:mm'),
                                    }}
                                />
                            )}
                            {domain.outzone_at && (
                                <FormattedMessage
                                    id="domains.domain.outzoneAt"
                                    tagName="p"
                                    values={{
                                        outzone_at: moment(domain.outzone_at).format(
                                            'DD.MM.Y HH:mm'
                                        ),
                                        strong: (text) => <strong>{text}</strong>,
                                    }}
                                />
                            )}
                            {domain.delete_at && (
                                <FormattedMessage
                                    id="domains.domain.deleteAt"
                                    tagName="p"
                                    values={{
                                        delete_at: moment(domain.delete_at).format('DD.MM.Y HH:mm'),
                                        strong: (text) => <strong>{text}</strong>,
                                    }}
                                />
                            )}
                            {domain.registrant_verification_asked_at && (
                                <FormattedMessage
                                    id="domains.domain.registrantVerificationAskedAt"
                                    tagName="p"
                                    values={{
                                        registrant_verification_asked_at: moment(
                                            domain.registrant_verification_asked_at
                                        ).format('DD.MM.Y HH:mm'),
                                        strong: (text) => <strong>{text}</strong>,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <button className="toggle" onClick={handleExtra} type="button">
                        <Icon name={isOpen ? 'caret up' : 'caret down'} />
                    </button>
                </div>
            </article>
        );
    }
    return null;
};

const DomainRegistrant = ({ contact }) => (
    <Table.Row key={contact.id}>
        <Table.Cell>{contact.name}</Table.Cell>
        <Table.Cell>{contact.email}</Table.Cell>
        <Table.Cell>{contact.phone}</Table.Cell>
    </Table.Row>
);

export default DomainGridItem;

// domain, lang
DomainGridItem.propTypes = {
    domain: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
};
