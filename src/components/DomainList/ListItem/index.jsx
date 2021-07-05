import React, { useState } from 'react';
import { Icon, Label, Table } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';

import PropTypes from 'prop-types';

import 'moment/locale/et';
import 'moment/locale/ru';
import { FormattedMessage, useIntl } from 'react-intl';
import domainStatuses from '../../../utils/domainStatuses.json';

const DomainListItem = ({ domain, lang }) => {
    moment.locale(lang);
    const { formatMessage } = useIntl();
    const [showStatuses, setShowStatuses] = useState(false);
    const handleStatuses = () => {
        setShowStatuses((prevState) => !prevState);
    };
    return (
        <Table.Row key={domain.id}>
            <Table.Cell>
                <Link to={`/domain/${domain.id}`}>{domain.name}</Link>
            </Table.Cell>
            <Table.Cell>
                <a
                    href={
                        domain.registrar.website.indexOf('http') > -1
                            ? domain.registrar.website
                            : `//${domain.registrar.website}`
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {domain.registrar.name}
                </a>
            </Table.Cell>
            <Table.Cell width={4}>
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
                            <FormattedMessage id={`domain.status.${status}`} tagName="span" />
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
            </Table.Cell>
            <Table.Cell width={3}>{moment(domain.valid_to).format('DD.MM.Y HH:mm')}</Table.Cell>
        </Table.Row>
    );
};

export default DomainListItem;

DomainListItem.propTypes = {
    domain: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
};
