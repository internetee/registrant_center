import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import DomainEditPage from './DomainEditPage';
import Providers from '../../__mocks__/Providers';

describe('pages/DomainEdit', () => {
	it('should render with given state from Redux store', () => {
		const component = shallow(
			<Providers>
				<DomainEditPage
					match={{
						params: {
							id: 'bd695cc9-1da8-4c39-b7ac-9a2055e0a93e',
						},
					}}
				/>
			</Providers>
		);
		expect(component).toMatchSnapshot();
	});
});
