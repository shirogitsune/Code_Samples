import React, {Component} from 'react';
import './SpottyParty.css';

class SpotGallery extends Component {
    constructor(props){
        super(props);
        this.state = {
            playingUrl:'',
            audio: null,
            playing: false
        }
    }
    playAudio(previewUrl) {
        let audio = new Audio(previewUrl);
        if (!this.state.playing) {
            audio.play();
            this.setState({
                playing:true,
                playingUrl:previewUrl,
                audio
            });
        } else {
            if (this.state.playingUrl === previewUrl) {
                this.state.audio.pause();
                this.setState({playing:false});
            } else {
                this.state.audio.pause();
                audio.play();
                this.setState({
                    playing: true,
                    playingUrl: previewUrl,
                    audio
                });
            }
        }
    }

    render() {
        const tracks = this.props.tracks;
        return(
           <div className="artistGallery">{
                tracks.map((track, key)=>{
                    return (
                        <div key={key} className="artistTrack" onClick={()=>{this.playAudio(track.preview_url)}}>
                            <img src={track.album.images[0].url} className="trackImage" alt={track.album.name} />
                            <div className="playWrapper">
                                <div className="playInner">{
                                    (this.state.playingUrl === track.preview_url)?<span>&#9208;</span>:<span>&#9654;</span>
                                }</div>
                            </div>
                            <p className="trackName">{track.name}</p>
                        </div>
                    );
                })
           }</div>
        );
    }
}
export default SpotGallery;