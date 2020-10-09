import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import ErrorPage from './ErrorPage';

describe('pages/ErrorPage', () => {
    it('should render', () => {
        const component = shallow(<ErrorPage />);
        expect(component).toMatchSnapshot();
    });
});
