import React, {Component} from 'react';
import VideoList from './VideoList';
import SearchBar from './SearchBar';
import VideoDetail from './VideoDetail';

import YTSearch from 'youtube-api-search';

class Utuber extends Component {
    constructor(props) {
        super(props);
        this.state = {
            apiKey: this.props.apikey,
            videos: [],
            selectedVideo: null
        };
    }

    /**
     * Perform a keyword search against the Youtube Search API
     * @param {String} term: The search term.
     */
    searchYoutube(term) {
        YTSearch({key: this.state.apiKey, term:term}, (videos)=>{
            this.setState({ videos:videos, selectedVideo: videos[0] });
        });
    }

    /**
     * Default render method
     * @returns {*} Component JSX
     */
    render() {
        if (this.state.videos.length > 0) {
            return (
                <div className="UTuber">
                    <header>
                        <SearchBar onSearchTermChange={term=>this.searchYoutube(term)} />
                    </header>
                    <section className="TuberBody">
                        <VideoDetail video={this.state.selectedVideo} />
                        <VideoList onVideoSelect={selectedVideo => this.setState({selectedVideo})} 
                            videos={this.state.videos} 
                        />
                    </section>
                </div>
            );
        } else {
            return (
            <div className="UTuber">
                <header>
                    <SearchBar onSearchTermChange={term=>this.searchYoutube(term)} />
                </header>
                <section className="TuberBody">
                    <div>Use the search bar above to search for great videos!</div>
                </section>
            </div>
            );
        }
    }
}
export default Utuber;