import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import {DomainList, UserData, MainLayout} from '../../components';

const HomePage = ({ domains, ui, user }) => {
  const { lang } = ui;
  moment.locale(lang);
  return (
    <MainLayout
      heroKey="dashboard.hero.text"
      heroValues={{
        lastVisit: moment(user.visited_at).format('D.MM.YYYY HH:mm')
      }}
      htmlTitleKey="dashboard.htmlTitle"
      titleKey="dashboard.title"
      titleValues={{
        name: `${user.first_name} ${user.last_name}`,
        span: text => <span>{text}</span>
      }}
      ui={ui}
      user={user}
    >
      <div className='page page--dashboard'>
        <div className="quicklinks">
          <Grid textAlign='center'>
            <Grid.Row>
              <Grid.Column widescreen={3} computer={4} tablet={8} mobile={8}>
                <Link to="/companies" className="quicklinks--link">
                  <Icon name="building" size='large'/>
                  <FormattedMessage
                    id="quicklinks.companies.title"
                  />
                </Link>
                <FormattedMessage
                  id="quicklinks.companies.text"
                  tagName="p"
                />
              </Grid.Column>
              <Grid.Column widescreen={3} computer={4} tablet={8} mobile={8}>
                <Link to="/whois" className="quicklinks--link">
                  <Icon name="user secret" size='large'/>
                  <FormattedMessage
                    id="quicklinks.whois.title"
                  />
                </Link>
                <FormattedMessage
                  id="quicklinks.whois.content"
                  values={{
                    a: linkText => (
                      <a href="https://www.internet.ee/domeenid/whois-teenuse-kasutajatingimused" rel="noreferrer" target="_blank">
                        {linkText}
                      </a>
                    ),
                  }}
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

const mapStateToProps = (state) => {
  return {
    domains: Object.values(state.domains.data),
  };
};

export default connect(mapStateToProps)(HomePage);
