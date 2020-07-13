import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Icon, Label, Table, Transition } from 'semantic-ui-react';
import moment from 'moment';
import 'moment/locale/et';
import 'moment/locale/ru';
import domainStatuses from '../../../utils/domainStatuses.json';

class DomainGridItem extends Component {
  
  state = {
    isOpen: false,
    showStatuses: false
  };
  
  handleExtra = () => {
    this.setState(prevState => ({
      ...prevState,
      isOpen: !prevState.isOpen,
      showStatuses: !prevState.isOpen
    }));
  };
  
  handleStatuses = () => {
    this.setState(prevState => ({
      ...prevState,
      showStatuses: !prevState.showStatuses
    }));
  };
  
  render() {
    const { isOpen, showStatuses } = this.state;
    const { domain, lang } = this.props;
    if (domain) {
      moment.locale(lang);
      return (
        <article className={classNames('domains-grid--item', { 'is-open': isOpen })}>
          <div className='container'>
            <div className='content'>
              <Link to={`/domain/${domain.id}`} className='link'>
                <h2>{domain.name}</h2>
              </Link>
              <p>
                {domain.registrar && domain.registrar.website ? (
                  <a
                    href={domain.registrar.website.indexOf('http') > -1 ? domain.registrar.website : `http://${domain.registrar.website}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {domain.registrar.name}
                  </a>
                ) : '-'}
              </p>
              <Label.Group className='statuses' size='large'>
                {domain.statuses.map((status, i) => (
                  <Label key={status} circular basic color={domainStatuses[status].color} title={domainStatuses[status][lang].definition} className={classNames({ 'hidden': !showStatuses && i > 0 })}>
                    <Icon name='circle'/>
                    <span>{domainStatuses[status][lang].label}</span>
                  </Label>
                ))}
                <Label as='a' role='button' onClick={this.handleStatuses} circular color='black' className={classNames({ 'hidden': domain.statuses.length < 2 })}>
                  {domain.statuses.length > 1 && (showStatuses ? `-${domain.statuses.length - 1}` : `+${domain.statuses.length - 1}`)}
                </Label>
              </Label.Group>
              <Transition visible={isOpen} animation={isOpen ? 'slide down' : 'slide down'} duration={300} unmountOnHide>
                <div className='extra'>
                  <h5>
                    <FormattedMessage
                      id='domains.domain.contacts.title'
                      defaultMessage='Kontaktid'
                    />
                  </h5>
                  <div className="table-wrap">
                    <Table basic='very' compact size='small' unstackable>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='domains.domain.contacts.type'
                              defaultMessage='Tüüp'
                              tagName='strong'
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='domains.domain.contacts.name'
                              defaultMessage='Nimi'
                              tagName='strong'
                            />
                          </Table.HeaderCell>
                          <Table.HeaderCell>
                            <FormattedMessage
                              id='domains.domain.contacts.email'
                              defaultMessage='E-post'
                              tagName='strong'
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        <DomainContacts type="tech" contacts={domain.tech_contacts}/>
                        <DomainContacts type="admin" contacts={domain.admin_contacts}/>
                      </Table.Body>
                    </Table>
                  </div>
                  <h5>
                    <FormattedMessage
                      id='domains.domain.nameservers.title'
                      defaultMessage='Nimeserverid'
                    />
                  </h5>
                  {domain.nameservers.length ? (
                    <div className="table-wrap">
                      <Table basic='very' compact size='small' unstackable>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>
                              <FormattedMessage
                                id='domains.domain.nameservers.hostname'
                                defaultMessage='Hostinimi'
                                tagName='strong'
                              />
                            </Table.HeaderCell>
                            <Table.HeaderCell><strong>IPv4</strong></Table.HeaderCell>
                            <Table.HeaderCell><strong>IPv6</strong></Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          <DomainNameservers nameservers={domain.nameservers}/>
                        </Table.Body>
                      </Table>
                    </div>
                  ) : (
                    <FormattedMessage
                      id='domain.nameservers.text'
                      defaultMessage='Nimeserverid puuduvad'
                      tagName='p'
                    />
                  )}
                </div>
              </Transition>
              <div className='data'>
                {domain.valid_to && (
                  <FormattedHTMLMessage
                    id='domains.domain.valid_to'
                    defaultMessage='Kehtiv kuni <strong>{valid_to}</strong>'
                    tagName='p'
                    values={{
                      valid_to: moment(domain.valid_to).format('DD.MM.Y HH:mm')
                    }}
                  />
                )}
                {domain.outzone_at && (
                  <FormattedHTMLMessage
                    id='domains.domain.outzone_at'
                    defaultMessage='Tsoonist eemaldatud <strong>{outzone_at}</strong>'
                    tagName='p'
                    values={{
                      outzone_at: moment(domain.outzone_at).format('DD.MM.Y HH:mm')
                    }}
                  />
                )}
                {domain.delete_at && (
                  <FormattedHTMLMessage
                    id='domains.domain.delete_at'
                    defaultMessage='Tsoonist kustutatakse <strong>{delete_at}</strong>'
                    tagName='p'
                    values={{
                      delete_at: moment(domain.delete_at).format('DD.MM.Y HH:mm')
                    }}
                  />
                )}
                {domain.registrant_verification_asked_at && (
                  <FormattedHTMLMessage
                    id='domains.domain.registrant_verification_asked_at'
                    defaultMessage='Kustutamine taodeldud <strong>{registrant_verification_asked_at}</strong>'
                    tagName='p'
                    values={{
                      registrant_verification_asked_at: moment(domain.registrant_verification_asked_at).format('DD.MM.Y HH:mm')
                    }}
                  />
                )}
              </div>
            </div>
            <button type='button' className='toggle' onClick={this.handleExtra}><Icon name={isOpen ? 'caret up' : 'caret down'}/></button>
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
      <Table.Cell width='5'>{item.hostname}</Table.Cell>
      <Table.Cell>{item.ipv4}</Table.Cell>
      <Table.Cell>{item.ipv6 ? item.ipv6 : '–'}</Table.Cell>
    </Table.Row>
  ));
};

const DomainContacts = ({ contacts, type }) => contacts.map(item => (
  <Table.Row key={item.id}>
    <Table.Cell width='3'>
      {type === 'admin' && (
        <FormattedMessage
          id='domains.domain.contacts.admin'
          defaultMessage='Admin'
          tagName='strong'
        />
      )}
      {type === 'tech' && (
        <FormattedMessage
          id='domains.domain.contacts.tech'
          defaultMessage='Tehniline'
          tagName='strong'
        />
      )}
    </Table.Cell>
    <Table.Cell>{item.name}</Table.Cell>
    <Table.Cell>{item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}</Table.Cell>
  </Table.Row>
));

DomainGridItem.propTypes = {
  lang: PropTypes.string.isRequired
};

export default DomainGridItem;
