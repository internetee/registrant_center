import { FormattedMessage } from 'react-intl';
import { Button, Container, Icon, Label, Loader, Message, Popup, Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import moment from 'moment';

// The privilege categories the registry can return (RdapPrivilegeGrant::CATEGORIES). The colour is
// a scanning aid only, mirroring how domain statuses are dotted elsewhere on this page. A category
// the portal does not know yet still renders — raw value, neutral dot — so a registry-side addition
// shows up as data rather than disappearing.
const CATEGORY_COLORS = {
    cert: 'teal',
    eis_internal: 'grey',
    police: 'blue',
    ria: 'violet',
};

const isKnownCategory = (category) =>
    Object.prototype.hasOwnProperty.call(CATEGORY_COLORS, category);

// The endpoint sends ISO-8601; every other date in the portal reads DD.MM.Y HH:mm. An unparseable
// value falls back to the raw string rather than rendering "Invalid date".
const formatAccessedAt = (value) => {
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('DD.MM.Y HH:mm') : value;
};

/**
 * "Who accessed my data" — the authority accesses the registry discloses to this domain's
 * registrant (RDAP spec 13, Surface B).
 *
 * Presentational only: the caller owns fetching and decides whether the panel is shown at all.
 * `events` stays undefined until a fetch succeeds, which is what keeps the four states apart —
 * an in-flight or failed load must never render as "no authority accessed your data".
 */
const DomainAccessEvents = ({ error = false, events, isLoading = false, onRetry, uiElemSize }) => {
    const hasEvents = Array.isArray(events) && events.length > 0;
    const isEmpty = !error && Array.isArray(events) && events.length === 0;

    return (
        <div className="page--block domain-access-events">
            <Container text>
                <header className="page--block--header">
                    <h2>
                        <FormattedMessage id="domain.accessEvents.title" />
                        <Popup basic inverted trigger={<Icon name="question circle" />}>
                            <FormattedMessage id="domain.accessEvents.tooltip" />
                        </Popup>
                    </h2>
                    {isEmpty ? <FormattedMessage id="domain.accessEvents.empty" tagName="p" /> : null}
                </header>
                {isLoading && !hasEvents ? (
                    <div className="domain-access-events--loading">
                        <Loader active data-test="access-events-loading" inline="centered" />
                    </div>
                ) : null}
                {error ? (
                    <Message data-test="access-events-error" negative>
                        <Message.Content>
                            <FormattedMessage id="domain.accessEvents.error" tagName="p" />
                            <Button
                                data-test="access-events-retry"
                                onClick={onRetry}
                                primary
                                size={uiElemSize}
                            >
                                <FormattedMessage id="domain.accessEvents.retry" tagName="span" />
                            </Button>
                        </Message.Content>
                    </Message>
                ) : null}
                {!error && hasEvents ? (
                    <Table basic="very">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    <FormattedMessage
                                        id="domain.accessEvents.institution"
                                        tagName="strong"
                                    />
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    <FormattedMessage
                                        id="domain.accessEvents.category"
                                        tagName="strong"
                                    />
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    <FormattedMessage
                                        id="domain.accessEvents.accessedAt"
                                        tagName="strong"
                                    />
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {events.map((event, index) => (
                                // The registry logs every request separately (no dedup), so two
                                // events can be identical in all three fields — the position in the
                                // server-ordered list is what makes the key unique.
                                <Table.Row
                                    data-test="access-events-row"
                                    key={`${event.accessed_at}-${event.category}-${
                                        event.organization || ''
                                    }-${index}`}
                                >
                                    <Table.Cell>
                                        {event.organization || (
                                            <FormattedMessage id="domain.accessEvents.institutionUnknown" />
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Label
                                            circular
                                            color={CATEGORY_COLORS[event.category] || 'grey'}
                                            empty
                                        />{' '}
                                        {isKnownCategory(event.category) ? (
                                            <FormattedMessage
                                                id={`domain.accessEvents.category.${event.category}`}
                                            />
                                        ) : (
                                            event.category
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{formatAccessedAt(event.accessed_at)}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                ) : null}
            </Container>
        </div>
    );
};

DomainAccessEvents.propTypes = {
    error: PropTypes.bool,
    events: PropTypes.arrayOf(
        PropTypes.shape({
            accessed_at: PropTypes.string,
            category: PropTypes.string,
            organization: PropTypes.string,
        })
    ),
    isLoading: PropTypes.bool,
    onRetry: PropTypes.func.isRequired,
    uiElemSize: PropTypes.string,
};

export default DomainAccessEvents;
