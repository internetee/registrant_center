import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import Providers from '../../../__mocks__/Providers';
import MainMenu from './MainMenu';

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

describe('MainMenu', () => {
    let store;
    let closeSpy;

    beforeEach(() => {
        store = createTestStore();
        closeSpy = vi.fn();
    });

    const sampleItems = [
        {
            id: 2089600,
            title: 'Parent',
            public_url: '/parent',
            language: { code: 'et' },
            node: { id: 2089600, parent_id: 2089596, position: 1 },
        },
        {
            id: 2089601,
            title: 'Child A',
            public_url: '/child-a',
            language: { code: 'et' },
            node: { id: 2089601, parent_id: 2089600, position: 1 },
        },
    ];

    const user = { ident: { code: '123' } };

    it('renders Dashboard link when user is present and calls close on click', () => {
        render(
            <Providers store={store}>
                <MainMenu closeMainMenu={closeSpy} items={[]} lang="et" user={user} />
            </Providers>
        );

        const dashboard = screen.getByRole('link', { name: /töölaud/i });
        expect(dashboard).toBeInTheDocument();

        fireEvent.click(dashboard);
        expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('toggles submenu open/closed', () => {
        render(
            <Providers store={store}>
                <MainMenu closeMainMenu={closeSpy} items={sampleItems} lang="et" user={user} />
            </Providers>
        );

        const listItem = screen.getByText('Parent').closest('li');
        expect(listItem).not.toHaveClass('u-submenu-open');

        fireEvent.click(screen.getByRole('button'));
        expect(listItem).toHaveClass('u-submenu-open');

        expect(screen.getByText('Child A')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));
        expect(listItem).not.toHaveClass('u-submenu-open');
    });
});
