import React from 'react';
import { Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

class MainFooter extends React.PureComponent {
  render() {
    const { ui } = this.props;
    const { lang, menus: { footer = [] } = []} = ui;
    const menu = footer.reduce((acc, item) => {
      if (item.language.code === lang) {
        const body = item.text.body.split('href="/').join('href="https://www.internet.ee/');
        acc.push({
          id: item.id,
          body
        });
      }
      return acc;
    }, []);
    return (
      <footer className="site-footer">
        <div className="footer-top">
          <a className="footer-logo" href="/et">
            <img src="/eis-logo-white.svg" alt="Logo"/>
          </a>
          <div className="footer-contacts">
            <div className="address">
              <FormattedMessage
                id="footer.eis"
                tagName="h3"
              />
              <p>
                <a href="https://goo.gl/maps/1FiwD8m5B8y" target="_self">Paldiski mnt 80, 10617 Tallinn</a>
              </p>
              <FormattedMessage
                id="footer.eis.registerCode"
                tagName="p"
              />
            </div>
            <ul className="quickinfo">
              <li><Icon name="envelope" /><a href="mailto:info@internet.ee">info@internet.ee</a></li>
              <li><Icon name="phone" />727 1000</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <nav className="menu-footer">
            {menu.map(item => (
              <div key={item.id} className="column" dangerouslySetInnerHTML={{__html: item.body}} />
            ))}
          </nav>
          <nav className="menu-social">
            <FormattedMessage
              id="footer.socialMedia"
              tagName="h3"
            />
            <ul>
              <li>
                <a href="https://www.facebook.com/EE-748656818569233/" title="Facebook">
                  <Icon name="facebook" />
                </a>
              </li>
              <li>
                <a href="https://twitter.com/Eesti_Internet" title="Twitter">
                  <Icon name="twitter" />
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UC7nTB6zIwZYPFarlbKuEPRA" title="Youtube">
                  <Icon name="youtube square" />
                </a>
              </li>
              <li>
                <a href="https://internet.ee/index.rss" title="RSS">
                  <Icon name="rss square" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    );
  }
}

export default MainFooter;
