import {FETCH_WEATHER} from '../constants';

/**
 * Get the search paramters for a given url
 * @param {String} url - The url we want to get the search parameters for.
 * @returns {Object} Parameter key/value pairs.
 */
function getParams(url) {
    const parser = document.createElement('a');
    let args = args, params = {};
    parser.href = url;
    args = parser.search.substr(1).split('&');
    args.map((arg, index) => {
        let a = arg.split('=');
        params[a[0]] = a[1];
    });
    return params;
}

/**
 * Weather Reducer
 * @param {*} state - Current state object (default empty array)
 * @param {*} action - Action passed by the action creator
 * @returns {*} New application state
 */
const WeatherReducer = (state = [], action) => {
    switch(action.type) {
        case FETCH_WEATHER:
            let data = action.payload.data;
            let params = getParams(action.payload.request.responseURL);
            data.units = params.units;
            return [data, ...state];
        default: 
            return state;
    }
};
export default WeatherReducer;