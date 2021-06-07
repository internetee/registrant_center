import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import CompaniesPage from './CompaniesPage';
import Providers from '../../__mocks__/Providers';

describe('pages/Companies', () => {
	it('should render with given state from Redux store', () => {
		const component = shallow(
			<Providers>
				<CompaniesPage />
			</Providers>
		);
		expect(component).toMatchSnapshot();
	});
});
