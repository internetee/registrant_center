import { PureComponent } from 'react';

class ScrollToTop extends PureComponent {
    componentDidUpdate(prevProps) {
        const { location } = this.props;
        if (location.pathname !== prevProps.location.pathname) {
            window.scrollTo(0, 0);
        }
    }

    render() {
        const { children } = this.props;
        return children;
    }
}
export default ScrollToTop;
