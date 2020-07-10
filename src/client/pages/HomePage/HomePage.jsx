import React, {PureComponent} from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import {Helmet, DomainList, UserData, MainLayout} from '../../components';

class HomePage extends PureComponent {
  
  render() {
    const { ui, domains, user } = this.props;
    const { lang } = ui;
    moment.locale(lang);
    return (
      <MainLayout ui={ui} user={user}>
        <FormattedMessage
          id="dashboard.page_title"
          defaultMessage='Töölaud | EIS Registreerijaportaal'
        >
          {title => (
            <Helmet>
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <div className="main-hero">
          <FormattedHTMLMessage
            id="dashboard.title"
            defaultMessage='<span>Hei</span>, {name}'
            tagName="h1"
            values={{
              name: `${user.first_name} ${user.last_name}`
            }}
          />
          <FormattedMessage
            id="dashboard.hero.text"
            defaultMessage="Tere tulemast tagasi. Viimati külastasid portaali: { lastVisit }"
            tagName="p"
            values={{
              lastVisit: moment(user.visited_at).format('D.MM.YYYY HH:mm')
            }}
          />
        </div>
        <div className='page page--dashboard'>
          <div className="quicklinks">
            <Grid textAlign='center'>
              <Grid.Row>
                <Grid.Column widescreen={3} computer={4} tablet={8} mobile={8}>
                  <Link to="/companies" className="quicklinks--link">
                    <Icon name="building" size='large'/>
                    <FormattedMessage
                      id="quicklinks.companies.title"
                      defaultMessage="Minu ettevõtted"
                    />
                  </Link>
                  <FormattedHTMLMessage
                    id="quicklinks.companies.text"
                    defaultMessage="Minu kõikide ettevõtete ülevaade"
                    tagName="p"
                  />
                </Grid.Column>
                <Grid.Column widescreen={3} computer={4} tablet={8} mobile={8}>
                  <Link to="/whois" className="quicklinks--link">
                    <Icon name="user secret" size='large'/>
                    <FormattedMessage
                      id="quicklinks.whois.title"
                      defaultMessage="WHOIS isikuandmed"
                    />
                  </Link>
                  <FormattedHTMLMessage
                    id="quicklinks.whois.text"
                    defaultMessage="Minu isikuandmete avaldamine WHOIS päringutes. Loe lähemalt <a href='https://www.internet.ee/domeenid/whois-teenuse-kasutajatingimused'>siit</a>"
                    tagName="p"
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
          <DomainList domains={domains} lang={lang} />
          <UserData lang={lang} />
        </div>
      </MainLayout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    domains: state.domains.data,
  };
};

export default connect(mapStateToProps)(HomePage);
