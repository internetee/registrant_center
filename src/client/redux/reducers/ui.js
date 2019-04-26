import Cookies from 'universal-cookie';
import api from '../../utils/api';

const cookies = new Cookies();
const SET_LANG = 'SET_LANG';
const TOGGLE_MAIN_MENU = 'TOGGLE_MAIN_MENU';
const CLOSE_MAIN_MENU = 'CLOSE_MAIN_MENU';
const GET_DEVICE_TYPE = 'GET_DEVICE_TYPE';

const fetchMenuAction = (menu, type) => `FETCH_MENU_${menu.toUpperCase()}_${type.toUpperCase()}`;

const getUiElementSize = width => {
  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 1224;
  if (isMobile) {
    return 'tiny';
  }
  if (isTablet) {
    return 'medium';
  }
  return 'big';
};

const setLang = lang => dispatch => {
  cookies.remove('locale');
  cookies.set('locale', lang, { path: '/' });
  dispatch({
    type: SET_LANG,
    lang
  });
};

const requestMenu = (menu) => (dispatch, getState) => {
  dispatch({
    type: fetchMenuAction(menu, 'request'),
    status: null,
    isLoading: true,
    isInvalidated: false,
    menus: getState().ui.menus,
  });
};

const receiveMenu = (menu, data) => (dispatch, getState) => {
  dispatch({
    type: fetchMenuAction(menu, 'success'),
    status: 200,
    menus: {
      ...getState().ui.menus,
      [menu]: data,
    },
    isLoading: false,
    isInvalidated: false,
  });
};

const invalidateMenuRequest = (menu, status) => {
  return {
    type: fetchMenuAction(menu, 'failure'),
    status,
    menus: {},
    isLoading: false,
    isInvalidated: true
  };
};

const fetchMenu = menu => dispatch => {
  dispatch(requestMenu(menu));
  return api.fetchMenu(menu)
    .then(res => res.data)
    .then(async data => {
      dispatch(receiveMenu(menu, data));
    })
    .catch(error => {
      dispatch(invalidateMenuRequest(menu, error.response.status));
    });
};

const toggleMainMenu = () => (dispatch, getState) => {
  dispatch({
    type: TOGGLE_MAIN_MENU,
    mainMenu: {
      isOpen: !getState().ui.mainMenu.isOpen
    }
  });
};

const closeMainMenu = () => dispatch => {
  dispatch({
    type: CLOSE_MAIN_MENU,
    mainMenu: {
      isOpen: false
    }
  });
};

const getDeviceType = (width) => (dispatch) => {
  dispatch({
    type: GET_DEVICE_TYPE,
    uiElemSize: getUiElementSize(width)
  });
};

const initialState = {
  menus: {},
  mainMenu: {
    isOpen: false
  },
  lang: cookies.get('locale') || 'et',
  uiElemSize: 'big'
};

export default function(state = initialState, action) {
  
  if (action.type && action.type.startsWith('FETCH_MENU')) {
    return {
      ...state,
      status: action.status,
      menus: {
        ...action.menus,
      },
      isLoading: action.isLoading,
      isInvalidated: action.isInvalidated,
    };
  }
  
  switch (action.type) {
    
  case TOGGLE_MAIN_MENU:
    return {
      ...state,
      mainMenu: action.mainMenu
    };
  
  case CLOSE_MAIN_MENU:
    return {
      ...state,
      mainMenu: action.mainMenu
    };
  
  case GET_DEVICE_TYPE:
    return {
      ...state,
      uiElemSize: action.uiElemSize
    };
  
  case SET_LANG:
    return {
      ...state,
      lang: action.lang
    };
    
  default:
    return state;
  }
};

export {
  initialState,
  fetchMenu,
  setLang,
  toggleMainMenu,
  closeMainMenu,
  getDeviceType
};