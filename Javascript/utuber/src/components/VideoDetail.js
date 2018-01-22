import React, {Component} from 'react';

class VideoDetail extends Component {

    /**
     * Default React renderer
     * @returns {*} Component JSX
     */
    render() {
        const video = this.props.video;
        if (!video) {
            return (
                <div style={{textAlign:'center',fontWeight:'bold'}}>Loading...</div>
            );
        }
        const url = `https://www.youtube.com/embed/${video.id.videoId}`;
        return (
            <section className="video-detail col-md-8">
                <div className="embed-responsive embed-responsive-16by9">
                    <iframe className="embed-responsive-item" src={url}/>
                </div>
                <div className="details">
                    <div className="title">{video.snippet.title}</div>
                    <div className="description">{video.snippet.description}</div>
                </div>
            </section>
        );
    }
}
export default VideoDetail;