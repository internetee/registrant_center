import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Label, Table} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
import 'moment/locale/et';
import 'moment/locale/ru';
import domainStatuses from '../../../utils/domainStatuses';

class DomainListItem extends Component {

  state = {
    showStatuses: false
  };
  
  handleStatuses = () => {
    this.setState(prevState => ({
      ...prevState,
      showStatuses: !prevState.showStatuses
    }));
  };
  
  render() {
    const { showStatuses } = this.state;
    const { domain, lang } = this.props;
    moment.locale(lang);
    return (
      <Table.Row key={ domain.id }>
        <Table.Cell>
          <Link to={`/domain/${encodeURIComponent(domain.name)}`}>{ domain.name }</Link>
        </Table.Cell>
        <Table.Cell>
          <a href={ domain.registrar.website.indexOf('http') > -1 ? domain.registrar.website : `//${domain.registrar.website}`} target='_blank' rel='noopener noreferrer'>{ domain.registrar.name }</a>
        </Table.Cell>
        <Table.Cell width={4}>
          <Label.Group className='statuses' size='large'>
            { domain.statuses.map((status,i) => (
              <Label key={status} circular basic color={domainStatuses[status].color} title={domainStatuses[status][lang].definition} className={ classNames({ 'hidden': !showStatuses && i > 0 }) }>
                <Icon name='circle' />
                <span>{ domainStatuses[status][lang].label }</span>
              </Label>
            ))}
            <Label as='a' role='button' onClick={this.handleStatuses} circular color='black' className={ classNames({ 'hidden': domain.statuses.length < 2 }) }>
              { domain.statuses.length > 1 && (
                showStatuses ? `-${domain.statuses.length - 1}`: `+${domain.statuses.length - 1}`
              ) }
            </Label>
          </Label.Group>
        </Table.Cell>
        <Table.Cell width={3}>
          {moment(domain.valid_to).format('DD.MM.Y HH:mm')}
        </Table.Cell>
      </Table.Row>
    );
  }
}

DomainListItem.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default DomainListItem;