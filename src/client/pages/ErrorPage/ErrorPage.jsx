import React from 'react';
import { FormattedMessage } from 'react-intl';
import {Icon} from 'semantic-ui-react';
import {Helmet, MainLayout, PageMessage} from '../../components';

function ErrorPage({ ui, user, history })  {
  return (
    <MainLayout ui={ui} user={user}>
      <FormattedMessage
        id="errorpage.page_title"
        defaultMessage='Error | EIS Registreerijaportaal'
      >
        {title => (
          <Helmet>
            <title>{title}</title>
          </Helmet>
        )}
      </FormattedMessage>
      <div className='main-hero'>
        <FormattedMessage
          id='errorpage.title'
          defaultMessage='Lehte ei leitud'
          tagName='h1'
        />
        <button type='button' className='back-link' onClick={ history.goBack }>
          <Icon name='arrow left' />
          <FormattedMessage
            id='hero.link.back'
            defaultMessage='Tagasi'
          />
        </button>
      </div>
      <PageMessage
        headerContent={(
          <FormattedMessage
            id="errorpage.none.message.title"
            defaultMessage="Kahjuks sellisele URL-le vastavat lehte ei leitud"
            tagName="span"
          />
        )}
        icon="times circle outline"
      >
        <FormattedMessage
          id='errorpage.none.message.text'
          defaultMessage='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque, consequuntur est facere fuga illum ipsa ipsum quasi quo! Commodi consequuntur eligendi harum non ut. Architecto blanditiis dignissimos nulla placeat praesentium.'
          tagName='p'
        />
      </PageMessage>
    </MainLayout>
  );
}

export default ErrorPage;
