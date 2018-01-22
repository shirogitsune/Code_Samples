import React, { Component } from 'react';

class GoogleMap extends Component{
    /**
     * Default Constructor
     * @param {*} props - React component props.
     */
    constructor(props) {
        super(props);
        this.state =  {
            name: this.props.city.name,
            lat: this.props.city.lat,
            lng: this.props.city.lon
        };
    }
    /**
     * React component lifecycle method: componentDidMount
     */
    componentDidMount() {
        new google.maps.Map(this.refs.map, {
            zoom: 10,
            center: {
                lat: this.state.lat,
                lng: this.state.lng
            }
        });
    }
    /**
     * React component lifecycle method: shouldComponentUpdate
     * @return {Boolean} Always false.
     */
    shouldComponentUpdate() {
        return false;
    }
    /**
     * Default React Renderer
     * @returns {*} Component JSX
     */
    render() {
        return(
            <div ref="map" title={this.state.name} />
        );
    }
}
export default GoogleMap;