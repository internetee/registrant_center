import api from "../../utils/api"
import {
    FETCH_COMPANIES_REQUEST,
    FETCH_COMPANIES_SUCCESS,
    FETCH_COMPANIES_FAILURE,
    LOGOUT_USER,
} from "../actions"

let request = {
    data: [],
    offset: 0,
}

const requestCompanies = () => ({
    type: FETCH_COMPANIES_REQUEST,
})

const receiveCompanies = (payload) => {
    request = {
        data: [],
        offset: 0,
    }

    return {
        payload,
        type: FETCH_COMPANIES_SUCCESS,
    }
}

const invalidateCompanies = () => ({
    type: FETCH_COMPANIES_FAILURE,
})

const fetchCompanies =
    (offset = request.offset) =>
    (dispatch) => {
        dispatch(requestCompanies())
        return api
            .fetchCompanies(offset)
            .then((res) => res.data)
            .then(({ companies }) => {
                request.data = request.data.concat(companies)
                if (companies.length === 200) {
                    request.offset += 200
                    return dispatch(fetchCompanies(request.offset))
                }
                return dispatch(receiveCompanies(request.data))
            })
            .catch(() => {
                return dispatch(invalidateCompanies())
            })
    }

const initialState = {
    data: {},
    ids: [],
    isLoading: null,
    message: null,
}

export default function reducer(state = initialState, { payload, type }) {
    switch (type) {
        case LOGOUT_USER:
            return initialState

        case FETCH_COMPANIES_FAILURE:
            return {
                ...state,
                isLoading: false,
            }

        case FETCH_COMPANIES_REQUEST:
            return {
                ...state,
                isLoading: true,
            }

        case FETCH_COMPANIES_SUCCESS:
            return {
                ...state,
                data: payload.reduce(
                    (acc, item) => ({
                        ...acc,
                        [item.registry_no]: item,
                    }),
                    {}
                ),
                ids: payload.map((item) => item.registry_no),
                isLoading: false,
                message: null,
            }

        default:
            return state
    }
}

export { initialState, fetchCompanies }
