import React, {Component} from 'react';
import {connect} from 'react-redux';

import Forecast from './Forecast';

class ForecastList extends Component {
    /**
     * Default React renderer
     * @returns {*} Component JSX
     */
    render() { 
        return(
            <section className="ForecastList">
                <table className="table table-hover">
                    <thead>
                        <tr><th>City</th><th>Temperature</th><th>Pressure</th><th>Humidity</th></tr>
                    </thead>
                    <tbody>
                    {
                        this.props.forecasts.map((data, index) =>{
                            return <Forecast key={index} forecast={data} />;
                        })
                    }
                    </tbody>
                </table>
            </section>
        );
    }
}
/**
 * Redux map state to props
 * @param {*} state - react state
 * @returns {Object} Mapped property
 */
function mapStateToProps(state) {
    return {
        forecasts: state.weather
    };
}
export default connect(mapStateToProps, null)(ForecastList);