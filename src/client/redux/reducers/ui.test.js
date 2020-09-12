import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cookies from 'universal-cookie';
import reducer, { setLang } from './ui';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const cookies = new Cookies();

describe('Locale action creators', () => {
    it('dipatches the right setLang action and sets cookie', () => {
        const expectedActions = [
            {
                type: 'SET_LANG',
                lang: 'en',
            },
        ];
        const store = mockStore({
            ui: {
                menus: {},
                uiElemSize: 'big',
                mainMenu: {
                    isOpen: false,
                },
                lang: 'et',
            },
        });
        store.dispatch(setLang('en'));
        expect(store.getActions()).toEqual(expectedActions);
        expect(cookies.get('locale')).toEqual('en');
    });
});

describe('Locale reducers', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            menus: {},
            uiElemSize: 'big',
            mainMenu: {
                isOpen: false,
            },
            lang: 'et',
        });
    });

    it('should handle SET_LANG', () => {
        expect(
            reducer([], {
                type: 'SET_LANG',
                lang: 'en',
            })
        ).toEqual({
            lang: 'en',
        });
    });
});
