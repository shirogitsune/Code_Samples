import React, {Component} from 'react';

class VideoListItem extends Component {

    /**
     * Default React renderer
     * @returns {*} Component JSX
     */
    render() {
        const video = this.props.video;
        return (
        <li className="Tuber" onClick={()=>this.props.onVideoSelect(video)}>
            <div className="video-list media">
                <div className="media-left">
                    <img src={video.snippet.thumbnails.default.url} 
                        className="media-item" 
                        height="75px" 
                    />
                </div>
                <div className="media-body">
                    <div className="media-heading">{video.snippet.title}</div>
                </div>
            </div>
        </li>
        );
    }
}
export default VideoListItem;