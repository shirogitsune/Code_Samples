import React, {Component} from 'react';
import './SpottyParty.css'

class SpotProfile extends Component {
    render() {
        let artist = {name: '', followers:{total:''}, images:[{url:''}], genres: []};
        artist = (this.props.artist !== null) ? this.props.artist:artist;

        return (
            <div className="artistProfile">{
                    (artist.images[0].url!=='')?<img alt={artist.name} src={artist.images[0].url} className="artistPicture" />:''
                }
                <div className="profileInformation">
                <div className="artistName">{artist.name}</div>
                <div className="artistFollowers">{(artist.followers.total!=='')?artist.followers.total + ' followers':''}</div>
                <div className="artistGenres">{
                    (artist.genres.length > 0) ? 'Genres: ':''
                }
                {
                    artist.genres.map((genre,k)=>{
                        genre = genre!== artist.genres[artist.genres.length-1]?`${genre}, `:`${genre}`;
                        return(<span key={k}>{genre}</span>);
                    })
                }</div>
                </div>
            </div>
        );
    }
}

export default SpotProfile;