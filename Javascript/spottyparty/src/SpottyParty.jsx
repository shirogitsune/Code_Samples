import React, {Component} from 'react';
import {FormGroup, FormControl, InputGroup, Glyphicon} from 'react-bootstrap';
import SpotProfile from './SpotProfile';
import SpotGallery from './SpotGallery';
import './SpottyParty.css';

class SpottyParty extends Component{
    constructor(props) {
        super(props);
        this.state = {
            authurl: 'https://accounts.spotify.com/authorize',
            searchurl: 'https://api.spotify.com/v1/search',
            artisturl: 'https://api.spotify.com/v1/artists',
            clientid: '545164747ea44a84920999de93a91aa7',
            access_token: null,
            query: '',
            artist: null,
            tracks: []
        };
    }

    componentWillMount() {
        if (this.props.params.access_token !== undefined) {
            this.setState({access_token: this.props.params.access_token});
        }
    }

    componentDidMount() {
        this.doAuthentication();
    }

    doAuthentication() {
        if (this.state.access_token === null) {
            let redirection = encodeURIComponent(window.location.toString().replace(/#/g, ''));
            window.location = `${this.state.authurl}?client_id=${this.state.clientid}&response_type=token&redirect_uri=${redirection}`;
        }
    }

    search() {
        let FETCHURL = `${this.state.searchurl}?type=artist&q=${this.state.query}&limit=1`;
        let requestHeaders = new Headers();
        requestHeaders.append('Authorization', 'Bearer ' + this.state.access_token);
        fetch(FETCHURL, 
              {
                  method: 'GET',
                  headers: requestHeaders
              })
              .then(response => {
                  if (response.ok){ 
                    return response.json();
                  } else {
                    throw new Error(response.status, response.statusText);
                  }
              })
              .then(json => {
                  const artist = json.artists.items[0];
                  this.setState({artist: artist});
                  FETCHURL = `${this.state.artisturl}/${artist.id}/top-tracks?country=US`;
                  fetch(FETCHURL, 
                  {
                      method:'GET',
                      headers:requestHeaders
                  })
                  .then(response=>response.json())
                  .then(json=>{
                      this.setState({tracks:json.tracks});
                  });
              })
              .catch(err=>{
                  this.setState({access_token:null});
                  this.doAuthentication();
              });
    }

    render() {
        return (
            <div className="SpottyParty">
                <h1 className="app-title">Spotify Party</h1>
                <FormGroup>
                    <InputGroup>
                        <FormControl type="text" 
                                     placeholder="Search for an artist..."
                                     value={this.state.query} 
                                     onChange={event => {this.setState({query: event.target.value})}}
                                     onKeyPress={event => {if(event.key === 'Enter'){this.search()}}}/>
                        <InputGroup.Addon onClick={() => this.search()}>
                            <Glyphicon glyph="search"></Glyphicon>
                        </InputGroup.Addon>
                    </InputGroup>
                </FormGroup>
                <SpotProfile artist={this.state.artist}/>
                <SpotGallery tracks={this.state.tracks} />
            </div>
        );
    }
}
export default SpottyParty;