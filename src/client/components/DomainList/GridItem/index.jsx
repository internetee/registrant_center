import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Icon, Label, Table, Transition } from 'semantic-ui-react';
import moment from 'moment';
import 'moment/locale/et';
import 'moment/locale/ru';
import domainStatuses from '../../../utils/domainStatuses.json';

class DomainGridItem extends Component {
    state = {
        isOpen: false,
        showStatuses: false,
    };

    handleExtra = () => {
        this.setState(prevState => ({
            ...prevState,
            isOpen: !prevState.isOpen,
            showStatuses: !prevState.isOpen,
        }));
    };

    handleStatuses = () => {
        this.setState(prevState => ({
            ...prevState,
            showStatuses: !prevState.showStatuses,
        }));
    };

    render() {
        const { isOpen, showStatuses } = this.state;
        const { domain, lang } = this.props;
        if (domain) {
            moment.locale(lang);
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
                                        title={domainStatuses[status][lang].definition}
                                    >
                                        <Icon name="circle" />
                                        <span>{domainStatuses[status][lang].label}</span>
                                    </Label>
                                ))}
                                <Label
                                    as="a"
                                    circular
                                    className={classNames({ hidden: domain.statuses.length < 2 })}
                                    color="black"
                                    onClick={this.handleStatuses}
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
                                        <FormattedMessage id="domains.domain.contacts.title" />
                                    </h5>
                                    <div className="table-wrap">
                                        <Table basic="very" compact size="small" unstackable>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.domain.contacts.type"
                                                            tagName="strong"
                                                        />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.domain.contacts.name"
                                                            tagName="strong"
                                                        />
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <FormattedMessage
                                                            id="domains.domain.contacts.email"
                                                            tagName="strong"
                                                        />
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                <DomainContacts
                                                    contacts={domain.tech_contacts}
                                                    type="tech"
                                                />
                                                <DomainContacts
                                                    contacts={domain.admin_contacts}
                                                    type="admin"
                                                />
                                            </Table.Body>
                                        </Table>
                                    </div>
                                    <h5>
                                        <FormattedMessage id="domains.domain.nameservers.title" />
                                    </h5>
                                    {domain.nameservers.length ? (
                                        <div className="table-wrap">
                                            <Table basic="very" compact size="small" unstackable>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>
                                                            <FormattedMessage
                                                                id="domains.domain.nameservers.hostname"
                                                                tagName="strong"
                                                            />
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell>
                                                            <strong>IPv4</strong>
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell>
                                                            <strong>IPv6</strong>
                                                        </Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    <DomainNameservers
                                                        nameservers={domain.nameservers}
                                                    />
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    ) : (
                                        <FormattedMessage
                                            id="domain.nameservers.text"
                                            tagName="p"
                                        />
                                    )}
                                </div>
                            </Transition>
                            <div className="data">
                                {domain.valid_to && (
                                    <FormattedMessage
                                        id="domains.domain.validTo"
                                        tagName="p"
                                        values={{
                                            strong: text => <strong>{text}</strong>,
                                            valid_to: moment(domain.valid_to).format(
                                                'DD.MM.Y HH:mm'
                                            ),
                                        }}
                                    />
                                )}
                                {domain.outzone_at && (
                                    <FormattedMessage
                                        id="domains.domain.outzoneAt"
                                        tagName="p"
                                        values={{
                                            strong: text => <strong>{text}</strong>,
                                            outzone_at: moment(domain.outzone_at).format(
                                                'DD.MM.Y HH:mm'
                                            ),
                                        }}
                                    />
                                )}
                                {domain.delete_at && (
                                    <FormattedMessage
                                        id="domains.domain.deleteAt"
                                        tagName="p"
                                        values={{
                                            strong: text => <strong>{text}</strong>,
                                            delete_at: moment(domain.delete_at).format(
                                                'DD.MM.Y HH:mm'
                                            ),
                                        }}
                                    />
                                )}
                                {domain.registrant_verification_asked_at && (
                                    <FormattedMessage
                                        id="domains.domain.registrantVerificationAskedAt"
                                        tagName="p"
                                        values={{
                                            strong: text => <strong>{text}</strong>,
                                            registrant_verification_asked_at: moment(
                                                domain.registrant_verification_asked_at
                                            ).format('DD.MM.Y HH:mm'),
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <button className="toggle" onClick={this.handleExtra} type="button">
                            <Icon name={isOpen ? 'caret up' : 'caret down'} />
                        </button>
                    </div>
                </article>
            );
        }
        return null;
    }
}

const DomainNameservers = ({ nameservers }) => {
    return nameservers.map(item => (
        <Table.Row key={item.ipv4}>
            <Table.Cell width="5">{item.hostname}</Table.Cell>
            <Table.Cell>{item.ipv4}</Table.Cell>
            <Table.Cell>{item.ipv6 ? item.ipv6 : '–'}</Table.Cell>
        </Table.Row>
    ));
};

const DomainContacts = ({ contacts, type }) =>
    contacts.map(item => (
        <Table.Row key={item.id}>
            <Table.Cell width="3">
                {type === 'admin' && (
                    <FormattedMessage
                        defaultMessage="Admin"
                        id="domains.domain.contacts.admin"
                        tagName="strong"
                    />
                )}
                {type === 'tech' && (
                    <FormattedMessage
                        defaultMessage="Tehniline"
                        id="domains.domain.contacts.tech"
                        tagName="strong"
                    />
                )}
            </Table.Cell>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>
                {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
            </Table.Cell>
        </Table.Row>
    ));

DomainGridItem.propTypes = {
    lang: PropTypes.string.isRequired,
};

export default DomainGridItem;
