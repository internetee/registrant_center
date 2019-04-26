import React from 'react';
import { FormattedMessage} from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Button, Container, Icon, Form } from 'semantic-ui-react';
import {Helmet, MainLayout, MessageModule} from '../../components';

class LoginPage extends React.PureComponent {

  render() {
    const { user, lang, ui } = this.props;
    const message = {
      code: user.status > 0 ? user.status : null,
      type: 'logout'
    };
    
    return (
      <MainLayout ui={ui} user={user}>
        <FormattedMessage
          id="login.page_title"
          defaultMessage='Logi sisse | EIS Registreerijaportaal'
        >
          {title => (
            <Helmet>
              <title>{title}</title>
            </Helmet>
          )}
        </FormattedMessage>
        <div className='main-hero'>
          <div className='u-container'>
            <FormattedMessage
              id='login.title'
              defaultMessage='Logi sisse'
              tagName='h1'
            />
            <FormattedMessage
              id='login.hero.text'
              defaultMessage='Sisenemine võimalik vaid Eesti riigi kodanikele ja e-residentidelem, kellel on ID-Kaart või Mobiil-ID.'
              tagName='p'
            />
          </div>
        </div>
        { message.code && <MessageModule message={message} lang={lang} /> }
        <div className="page page--login">
          <div className='u-container'>
            <Container text textAlign='center' className='page--login--area'>
              <FormattedMessage
                id='login.content.title'
                defaultMessage='Sisene ID-kaardi või Mobiil-IDga'
                tagName='h3'
              />
              <FormattedMessage
                id='login.content.text'
                defaultMessage='Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus.'
                tagName='p'
              />
              <div className="login-options">
                <div className="login-options--item">
                  <Icon name='id card' size='big' />
                  <FormattedMessage
                    id='login.options.id_card'
                    defaultMessage='ID-kaart'
                    tagName='p'
                  />
                </div>
                <div className="login-options--item">
                  <Icon name='mobile alternate' size='big' />
                  <FormattedMessage
                    id='login.options.mobile_id'
                    defaultMessage='ID-kaart'
                    tagName='p'
                  />
                </div>
                <div className="login-options--item">
                  <Icon name='lock' size='big' />
                  <FormattedMessage
                    id='login.options.eidas'
                    defaultMessage='eIDAS'
                    tagName='p'
                  />
                </div>
                <div className="login-options--item">
                  <Icon name='mobile alternate' size='big' />
                  <FormattedMessage
                    id='login.options.smart_id'
                    defaultMessage='Smart-ID'
                    tagName='p'
                  />
                </div>
              </div>
              <Form action="/connect/openid">
                <Button primary type='submit' size={ui.uiElemSize}>
                  <FormattedMessage
                    id='login.button_login'
                    defaultMessage='Logi sisse'
                    tagName='span'
                  />
                </Button>
              </Form>
            </Container>
          </div>
        </div>
      </MainLayout>
    );
  }
}

export default withRouter(LoginPage);