import React, {Component} from 'react';
import VideoListItem from './VideoListItem';

class VideoList extends Component {

    /**
     * Default React renderer
     * @returns {*} Component JSX
     */
    render() {
        const videoList = this.props.videos;
        return (
            <section className="TuberListContainer">
                <ul className="TuberList list-group">
                {
                    videoList.map((video)=>{
                        return ( 
                            <VideoListItem onVideoSelect={this.props.onVideoSelect}
                                video={video} 
                                key={video.etag} 
                            />
                        );
                    })
                }
                </ul>
            </section>
        );
    }
}
export default VideoList;