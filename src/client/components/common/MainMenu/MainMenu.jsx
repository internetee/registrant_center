import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

class MainMenu extends Component {
  state = {
    menu: []
  };
  
  componentDidMount() {
    const { items, lang } = this.props;
    const menu = items.reduce((acc, item) => {
      // Exclude portals menu items
      const exludedItems = [2133844,2223713,2142515];
      // Find current language first level menu items
      if (item.language.code === lang && item.node.parent_id === 2089596 && !exludedItems.includes(item.node.id)) {
        // Find current menu items children
        const children = items.filter(child => {
          return child.node.parent_id === item.node.id && child.language.code === lang && !exludedItems.includes(child.node.id);
        });
        acc.push({
          ...item,
          isOpen: false,
          children
        });
      }
      return acc;
    }, []).sort((a, b) => {
      return a.node.position - b.node.position;
    });
    this.setState({
      menu
    });
  }
  
  handleSubmenu = (cur) => {
    this.setState(prevState => ({
      ...prevState,
      menu: prevState.menu.map((item, i) => {
        if (cur === i) {
          return {
            ...item,
            isOpen: !item.isOpen
          };
        }
        return item;
      })
    }));
  };
  
  render() {
    const { user, closeMainMenu } = this.props;
    const { menu } = this.state;
    
    return (
      <React.Fragment>
        <nav className='menu-main'>
          <ul>
            { user && user.ident && (
              <li>
                <Link to='/' onClick={() => closeMainMenu()}>
                  <FormattedMessage
                    id='menu.main.dashboard'
                    defaultMessage='Töölaud'
                  />
                </Link>
              </li>
            )}
            { menu.map((item, i) => (
              <li key={ item.id } className={ item.isOpen ? 'u-submenu-open' : '' }>
                <a href={ item.public_url }>{ item.title }</a>
                { item.children && item.children.length > 0 && (
                  <React.Fragment>
                    <button type='button' className='btn btn--submenu-toggle' onClick={() => this.handleSubmenu(i)}>
                      <Icon name='angle down' />
                    </button>
                    <ul>
                      { item.children.map(subitem => (
                        <li key={ subitem.id }><a href={ subitem.public_url }>{ subitem.title }</a></li>
                      ))}
                    </ul>
                  </React.Fragment>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </React.Fragment>
    );
  }
}

MainMenu.propTypes = {
  lang: PropTypes.string.isRequired,
};

export default MainMenu;