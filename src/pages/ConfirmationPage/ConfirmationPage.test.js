import 'core-js';
import React from 'react';
import { shallow } from 'enzyme';
import ConfirmationPage from './ConfirmationPage';
import Providers from '../../__mocks__/Providers';

describe('pages/Home', () => {
	it('should render content', () => {
		const component = shallow(
			<Providers>
				<ConfirmationPage />
			</Providers>
		);
		expect(component).toMatchSnapshot();
	});
});
