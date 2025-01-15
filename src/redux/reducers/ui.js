import Cookies from 'universal-cookie';
import api from '../../utils/api';

const cookies = new Cookies();
const SET_LANG = 'SET_LANG';
const TOGGLE_MAIN_MENU = 'TOGGLE_MAIN_MENU';
const CLOSE_MAIN_MENU = 'CLOSE_MAIN_MENU';
const GET_DEVICE_TYPE = 'GET_DEVICE_TYPE';

const fetchMenuAction = (menu, type) => `FETCH_MENU_${menu.toUpperCase()}_${type.toUpperCase()}`;

const getUiElementSize = (width) => {
    const isMobile = width < 480;
    const isTablet = width >= 480 && width < 1224;
    if (isMobile) {
        return 'small';
    }
    if (isTablet) {
        return 'large';
    }
    return 'big';
};

const setLang = (lang) => (dispatch) => {
    cookies.remove('locale');
    cookies.set('locale', lang, { path: '/' });
    dispatch({
        lang,
        type: SET_LANG,
    });
};

const requestMenu = (menu) => {
    return {
        isInvalidated: false,
        isLoading: true,
        status: null,
        type: fetchMenuAction(menu, 'request'),
    };
};

const receiveMenu = (menu, data) => ({
    isInvalidated: false,
    isLoading: false,
    payload: {
        [menu]: data,
    },
    status: 200,
    type: fetchMenuAction(menu, 'success'),
});

const invalidateMenuRequest = (menu, status) => {
    return {
        isInvalidated: true,
        isLoading: false,
        payload: {
            [menu]: null,
        },
        status,
        type: fetchMenuAction(menu, 'failure'),
    };
};

const fetchMenu = (menu) => (dispatch) => {
    dispatch(requestMenu(menu));
    return api
        .fetchMenu(menu)
        .then((res) => res.data)
        .then((data) => {
            return dispatch(receiveMenu(menu, data));
        })
        .catch((error) => {
            return dispatch(invalidateMenuRequest(menu, error.response.status));
        });
};

const toggleMainMenu = () => (dispatch) => {
    dispatch({
        type: TOGGLE_MAIN_MENU,
    });
};

const closeMainMenu = () => (dispatch) => {
    dispatch({
        type: CLOSE_MAIN_MENU,
    });
};

const getDeviceType = (width) => (dispatch) => {
    dispatch({
        type: GET_DEVICE_TYPE,
        uiElemSize: getUiElementSize(width),
    });
};

const initialState = {
    isMainMenuOpen: false,
    lang: cookies.get('locale') || 'et',
    menus: {},
    uiElemSize: 'big',
};

export default function reducer(state = initialState, action) {
    if (action.type && action.type.startsWith('FETCH_MENU')) {
        return {
            ...state,
            isInvalidated: action.isInvalidated,
            isLoading: action.isLoading,
            menus: {
                ...state.menus,
                ...action.payload,
            },
            status: action.status,
        };
    }

    switch (action.type) {
        case TOGGLE_MAIN_MENU:
            return {
                ...state,
                isMainMenuOpen: !state.isMainMenuOpen,
            };

        case CLOSE_MAIN_MENU:
            return {
                ...state,
                isMainMenuOpen: false,
            };

        case GET_DEVICE_TYPE:
            return {
                ...state,
                uiElemSize: action.uiElemSize,
            };

        case SET_LANG:
            return {
                ...state,
                lang: action.lang,
            };

        default:
            return state;
    }
}

export { initialState, fetchMenu, setLang, toggleMainMenu, closeMainMenu, getDeviceType };
