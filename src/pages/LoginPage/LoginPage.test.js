import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import LoginPage from './LoginPage';
import Providers from '../../__mocks__/Providers';

describe('pages/Home', () => {
	it('should render content', () => {
		const component = shallow(
			<Providers>
				<LoginPage />
			</Providers>
		);
		expect(component).toMatchSnapshot();
	});
});
