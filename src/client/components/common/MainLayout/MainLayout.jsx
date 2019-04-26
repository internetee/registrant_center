import React from 'react';
import MainHeader from '../MainHeader/MainHeader';
import MainFooter from '../MainFooter/MainFooter';

class MainLayout extends React.PureComponent {
  render() {
    const { ui, user, children } = this.props;
    return (
      <React.Fragment>
        <MainHeader ui={ui} user={user} />
        <main className="main-layout">
          {children}
        </main>
        <MainFooter ui={ui} />
      </React.Fragment>
    );
  }
}
export default MainLayout;