/* eslint-disable */
import { SET_TECH, GET_TECH } from '../actions';

const setSortByRoles = (isTech) => ({
    payload: isTech,
    type: SET_TECH,
});

const initialState = {
    isTech: 'init',
};

export default function reducer(state = initialState, { payload, type }) {
    if (type === 'SET_TECH') {
        return {
            ...state,
            isTech: payload,
        };
    }
    return state;
}

export { initialState, setSortByRoles };
