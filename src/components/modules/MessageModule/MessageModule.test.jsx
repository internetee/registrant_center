import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import MessageModule from './MessageModule';
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

describe('MessageModule', () => {
    let store;

    beforeEach(() => {
        store = createTestStore();
    });

    it('renders error message correctly', () => {
        const errorMessage = {
            code: 404,
            type: 'domainUnlock',
        };

        const { container } = render(
            <Providers store={store}>
                <MessageModule message={errorMessage} />
            </Providers>
        );

        // Check if message exists with correct class
        const messageElement = container.querySelector('.message');
        expect(messageElement).toBeInTheDocument();
        expect(messageElement).toHaveClass('negative');
        expect(messageElement).toHaveClass('status-message');
    });

    it('renders success message correctly', () => {
        const successMessage = {
            code: 200,
            type: 'domainUnlock',
        };

        const { container } = render(
            <Providers store={store}>
                <MessageModule message={successMessage} />
            </Providers>
        );

        // Check if message exists with correct class
        const messageElement = container.querySelector('.message');
        expect(messageElement).toBeInTheDocument();
        expect(messageElement).toHaveClass('positive');
        expect(messageElement).toHaveClass('status-message');
    });

    it('renders form message with icon when formMessage prop is true', () => {
        const successMessage = {
            code: 200,
            type: 'domainUnlock',
        };

        const { container } = render(
            <Providers store={store}>
                <MessageModule formMessage={true} message={successMessage} />
            </Providers>
        );

        // Check if message has icon
        expect(container.querySelector('.icon')).toBeInTheDocument();
        expect(container.querySelector('.check.circle.icon')).toBeInTheDocument();

        // Check if message doesn't have status-message class
        const messageElement = container.querySelector('.message');
        expect(messageElement).not.toHaveClass('status-message');
    });

    it('renders error form message with correct icon', () => {
        const errorMessage = {
            code: 404,
            type: 'domainUnlock',
        };

        const { container } = render(
            <Providers store={store}>
                <MessageModule formMessage={true} message={errorMessage} />
            </Providers>
        );

        // Check if message has error icon
        expect(container.querySelector('.check.circle')).toBeInTheDocument();
    });

    it('returns null when no message is provided', () => {
        const { container } = render(
            <Providers store={store}>
                <MessageModule />
            </Providers>
        );

        expect(container.querySelector('.message')).not.toBeInTheDocument();
    });

    it('renders message header with correct translation key', () => {
        const message = {
            code: 200,
            type: 'test',
        };

        const { container } = render(
            <Providers store={store}>
                <MessageModule message={message} />
            </Providers>
        );

        // Check if message header contains the correct translation key
        const messageHeader = container.querySelector('.header');
        expect(messageHeader).toBeInTheDocument();
        expect(messageHeader.textContent).toContain('Test 200');
    });

    it('returns null when message is undefined', () => {
        const { container } = render(
            <Providers store={store}>
                <MessageModule />
            </Providers>
        );

        expect(container.querySelector('.message')).not.toBeInTheDocument();
    });

    it('returns null when message is null', () => {
        const { container } = render(
            <Providers store={store}>
                <MessageModule message={null} />
            </Providers>
        );

        expect(container.querySelector('.message')).not.toBeInTheDocument();
    });
});
