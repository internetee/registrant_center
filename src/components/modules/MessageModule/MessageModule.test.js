import 'core-js';
import React from 'react';
import { mount, shallow } from 'enzyme';
import MessageModule from './MessageModule';
import Providers from '../../../__mocks__/Providers';

describe('components/modules/MessageModule', () => {
	const mockErrorMessage = {
		code: 404,
		type: 'test',
	};

	const mockSuccessMessage = {
		code: 200,
		type: 'test',
	};

	it('should render', () => {
		const cmp = shallow(
			<Providers>
				<MessageModule message={mockErrorMessage} />
			</Providers>
		);
		expect(cmp).toMatchSnapshot();
		cmp.unmount();
	});

	it('should render error message', () => {
		const cmp = mount(
			<Providers>
				<MessageModule message={mockErrorMessage} />
			</Providers>
		);
		expect(cmp.find('.message').hasClass('negative')).toBeTruthy();
		cmp.unmount();
	});

	it('should render success message', () => {
		const cmp = mount(
			<Providers>
				<MessageModule message={mockSuccessMessage} />
			</Providers>
		);
		expect(cmp.find('.message').hasClass('positive')).toBeTruthy();
		cmp.unmount();
	});
});
