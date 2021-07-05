import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import WhoIsPage from './WhoIsPage';
import Providers from '../../__mocks__/Providers';

describe('pages/Home', () => {
    it('should render content', () => {
        const component = shallow(
            <Providers>
                <WhoIsPage />
            </Providers>
        );
        expect(component).toMatchSnapshot();
    });
});
