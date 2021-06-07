import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import HomePage from './HomePage';
import Providers from '../../__mocks__/Providers';

describe('pages/Home', () => {
	it('should render content', () => {
		const component = shallow(
			<Providers>
				<HomePage fetchDomains={jest.fn()} />
			</Providers>
		);
		expect(component).toMatchSnapshot();
	});
});
