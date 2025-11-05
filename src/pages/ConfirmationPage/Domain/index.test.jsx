import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import Providers from '../../../__mocks__/Providers';
import contactsMock from '../../../__mocks__/contacts';
import Domain from './index';
import React from 'react';

vi.mock('../../../components', () => ({
    WhoIsEdit: (props) => <div data-testid="whois-edit" data-open={props.isOpen ? '1' : '0'} />,
}));

const createTestStore = () => {
    const baseState = {
        ui: {
            uiElemSize: 'small',
            lang: 'et',
            menus: { main: [] },
            isMainMenuOpen: false,
        },
    };

    return configureStore({
        reducer: Object.entries(baseState).reduce(
            (acc, [key, value]) => ({
                ...acc,
                [key]: (state = value) => state,
            }),
            {}
        ),
    });
};

describe('ConfirmationPage/Domain', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    it('renders domain link and WhoIsEdit closed by default, toggles open on click', () => {
        const onChange = vi.fn();
        render(
            <Providers store={store}>
                <table><tbody>
                    <Domain id="abc" name="example.ee" contacts={contactsMock} onChange={onChange} />
                </tbody></table>
            </Providers>
        );

        const link = screen.getByRole('link', { name: 'example.ee' });
        expect(link).toHaveAttribute('href', '/domain/abc');

        const toggle = screen.getByRole('button', { name: /detail/i });
        fireEvent.click(toggle);
        expect(screen.getByTestId('whois-edit').getAttribute('data-open')).toBe('1');
    });
});
