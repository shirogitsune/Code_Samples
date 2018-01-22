import React, {Component} from 'react';

/**
 * SearchBar Component
 * This component handles all the responsibilities of the search bar.
 */
class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchterm: ''
        };
    }
    /** Performs search against the Youtube API */
    performSearch() {
        this.props.onSearchTermChange(this.state.searchterm);
    }

    /** Search field input change handler.
     * @param {Object} evt: DOM Event
     */
    onInputChange(evt) {
        this.setState({searchterm: evt.target.value});
    }

    /** Search fiels keypress handler
     * @param {Object} evt: DOM Event
     */
    onInputKeyPress(evt) {
        if(evt.key === 'Enter'){ //On Enter, perform search
            this.performSearch();
        }
    }

    /** Default React renderer 
     * @returns {*} Component JSX
     */
    render() {
        return (
            <section className="TuberSearch form-inline">
                <img src="img/utuber-logo.png" className="logo" />
                <input type="search" 
                    placeholder="Search for..."
                    className="SearchBar form-control"
                    value={this.state.searchterm}
                    onChange={event=>this.onInputChange(event)}
                    onKeyPress={e=>this.onInputKeyPress(e)}
                />
                <button className="btn btn-small btn-primary" onClick={()=>this.performSearch()}>
                    Search
                </button>
            </section>
        );
    }
}
export default SearchBar;