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
                lang: 'en',
                type: 'SET_LANG',
            },
        ];
        const store = mockStore({
            ui: {
                lang: 'et',
                mainMenu: {
                    isOpen: false,
                },
                menus: {},
                uiElemSize: 'big',
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
            lang: 'et',
            mainMenu: {
                isOpen: false,
            },
            menus: {},
            uiElemSize: 'big',
        });
    });

    it('should handle SET_LANG', () => {
        expect(
            reducer([], {
                lang: 'en',
                type: 'SET_LANG',
            })
        ).toEqual({
            lang: 'en',
        });
    });
});
