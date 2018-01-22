import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchWeather} from '../actions/FetchWeather';

class SearchBar extends Component {
    /**
     * Default Constructor
     * @param {*} props - React component props.
     */
    constructor(props) {
        super(props);
        this.state = {
            searchterm: '',
            units: 'imperial'
        };

        //Event handler bindings
        this.onInputChange = this.onInputChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onUnitChange = this.onUnitChange.bind(this);
    }

    /**
     * Form submit handler
     * @param {*} event - DOM event object
     */    
    onFormSubmit(event) {
        event.preventDefault();
        this.props.fetchWeather(this.state.searchterm, this.state.units);
        this.setState({searchterm: ''});
    }

    /**
     * Input field change handler
     * @param {*} event - DOM event object
     */
    onInputChange(event) {
        this.setState({searchterm:event.target.value});
    }

    /**
     * Handler for the units drop down
     * @param {*} event - DOM event onject
     */
    onUnitChange(event) {
        this.setState({units: event.target.value});
    }

    /**
     * React default renderer
     * @returns {*} Component JSX
     */
    render() {
        return (
            <section className="SearchBar">
                <form className="input-group" onSubmit={this.onFormSubmit}>
                    <input type="search" 
                        className="searchterm form-control" 
                        placeholder="Search Weather Forcast by City, State or Postal Code..."
                        value={this.state.searchterm}
                        onChange={this.onInputChange}
                    />
                    <select className="form-control drop-down"
                        onChange={this.onUnitChange}
                        value={this.state.units}
                    > 
                        <option value="metric">Metric (&deg;C)</option>
                        <option value="imperial">Imperial (&deg;F)</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Search</button>
                </form>
            </section>
        );
    }
}
/**
 * Redux map dispatch to props
 * @param {*} dispatch - Redux action
 * @return {*} Action creators
 */
function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchWeather}, dispatch);
}
export default connect(null, mapDispatchToProps)(SearchBar);