import React from 'react';
import 'core-js';
import { shallow } from 'enzyme';
import UserData from './UserData';
import Providers from '../../__mocks__/Providers';
import contacts from '../../__mocks__/contacts';
import domains from '../../__mocks__/domains';

describe('components/UserData', () => {
	it('should show content', () => {
		const cmp = shallow(
			<Providers>
				<UserData contacts={contacts} domains={domains} />
			</Providers>
		);
		expect(cmp).toMatchSnapshot();
	});
});
