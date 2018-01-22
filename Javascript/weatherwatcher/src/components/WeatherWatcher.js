import React, { Component } from 'react';

import SearchBar from './SearchBar';
import ForecastList from './ForecastList';

class WeatherWatcher extends Component {
  /**
   * Default React Renderer
   * @returns {*} Component JSX
   */
  render() {
    return (
      <div className="WeatherWatcher">
          <header className="heading">
            <img src="img/rain.png" />
            <h1>WeatherWatcher</h1>
          </header>
          <SearchBar />
          <ForecastList />
      </div>
    );
  }
}
export default WeatherWatcher;