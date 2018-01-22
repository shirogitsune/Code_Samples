import React, {Component} from 'react';
import {Sparklines, SparklinesLine, SparklinesSpots, SparklinesReferenceLine} from 'react-sparklines';
import GoogleMap from './GoogleMap';

class Forecast extends Component {
    /**
     * Default React Renderer
     * @returns {*} Component JSX
     */
    render() {
        const currentForecast = {
            city: {name: this.props.forecast.city.name, 
                   lat: this.props.forecast.city.coord.lat, 
                   lon: this.props.forecast.city.coord.lon},
            temps: this.props.forecast.list.map(weather => weather.main.temp),
            tempunits: this.props.forecast.units,
            pressure: this.props.forecast.list.map(weather => weather.main.pressure),
            humidity: this.props.forecast.list.map(weather => weather.main.humidity)
        };
        const lockey = currentForecast.city.lat+''+currentForecast.city.lon;
        return (
            <tr className="Forecast">
                <td>
                    <GoogleMap key={lockey} city={currentForecast.city} />
                </td>
                <td>
                    <Sparklines data={currentForecast.temps} height={120} width={180}>
                        <SparklinesLine color="orange" />
                        <SparklinesSpots />
                        <SparklinesReferenceLine type="avg" />
                    </Sparklines>
                    <div>Current: {Math.round(currentForecast.temps[currentForecast.temps.length-1])}&deg; 
                        {currentForecast.tempunits.toLowerCase()==='imperial'?'F':'C'}</div>
                </td>
                <td>
                    <Sparklines data={currentForecast.pressure} height={120} width={180}>
                        <SparklinesLine color="green" />
                        <SparklinesSpots />
                        <SparklinesReferenceLine type="avg" />
                    </Sparklines>
                    <div>Current: {currentForecast.pressure[currentForecast.pressure.length-1]} hPa</div>
                </td>
                <td>
                    <Sparklines data={currentForecast.humidity} height={120} width={180}>
                        <SparklinesLine color="blue" />
                        <SparklinesSpots />
                        <SparklinesReferenceLine type="avg" />
                    </Sparklines>
                    <div>Current: {currentForecast.humidity[currentForecast.humidity.length-1]} %</div>
                </td>
            </tr>
        )
    }
}
export default Forecast;