import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import Loading from './Loading';
import Providers from '../../../__mocks__/Providers';

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

describe('Loading', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    it('renders loading component correctly', () => {
        const { container } = render(
            <Providers store={store}>
                <Loading />
            </Providers>
        );

        // Check if loading component exists
        expect(container.querySelector('.loading')).toBeInTheDocument();

        // Check if loading text is displayed
        expect(container.textContent).toContain('Laen');
    });
});
