import axios from 'axios';
import {FETCH_WEATHER, API_KEY, API_PROTOCOL, API_ENDPOINT} from '../constants';

/**
 * Builds the URL for querying the OpenWeatherMap API, differentiating
 * between City, State queries and Zip Code queries
 * @param {String} searchTerm - Search parameter
 * @param {String} units - The type of units to use.
 * @returns {String} API query URL
 */
function getEndPointUrl(searchTerm, units) {
    let url = '';
    const term = searchTerm;
    if (term.replace(/\D+/g, '').length >= 5) {
        url = API_PROTOCOL + '//' + API_ENDPOINT + `&zip=${term},us&units=${units}`;
    } else {
        url = API_PROTOCOL + '//' +API_ENDPOINT + `&q=${term},us&units=${units}`;
    }
    return url;
}
/**
 * fetchWeather action creator.
 * @param {*} searchTerm - The term we are searching with (zip code or city/state)
 * @param {*} units - The units to use in the reply (metric or imperial)
 * @returns {Object} Redux action
 */
export const fetchWeather = (searchTerm, units) => {
    const request = axios.get(getEndPointUrl(searchTerm, units));  
    return {
        type: FETCH_WEATHER,
        payload: request
    };
};