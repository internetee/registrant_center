import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon, Table} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {WhoIsEdit} from '../../../components';
import Helpers from '../../../utils/helpers';

class Domain extends Component {
  
  state = {
    isOpen: false
  };
  
  toggleOpen = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  };
  
  render() {
    const { isOpen } = this.state;
    const { user, domain, contacts, lang, handleWhoIsChange } = this.props;
    const userContacts = Helpers.getUserContacts(user, domain, contacts);
    return (
      <Table.Row key={domain.id} verticalAlign='top'>
        <Table.Cell width={6}>
          <Link to={`/domain/${domain.name}`}>{ domain.name }</Link>
        </Table.Cell>
        <Table.Cell width={8}>
          <div className="ui form">
            <WhoIsEdit contacts={userContacts} lang={lang} checkAll isOpen={isOpen} handleWhoIsChange={handleWhoIsChange} />
          </div>
        </Table.Cell>
        <Table.Cell textAlign='right' singleLine width={2}>
          <button type='button' onClick={this.toggleOpen}>
            <FormattedMessage
              id='whois.button.detail_info'
              defaultMessage='Detailne info'
              tagName='span'
            />
            <Icon className={classNames({'vertically flipped': isOpen })} name='angle down' />
          </button>
        </Table.Cell>
      </Table.Row>
    );
  }
}

Domain.propTypes = {
  lang: PropTypes.string,
  handleWhoIsChange: PropTypes.func.isRequired
};

Domain.defaultProps = {
  lang: 'et',
};


export default Domain;