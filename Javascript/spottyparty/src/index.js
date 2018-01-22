import React from 'react';
import ReactDom from 'react-dom';
import SpottyParty from './SpottyParty';

let hashparams = {}
if (window.location.hash !== undefined) {
    window.location.hash.substring(1).split('&').forEach((elem) => {
        let param = elem.split('=');
        hashparams[param[0]] = param[1];
    });
    window.location.hash = '';
}
ReactDom.render(<SpottyParty params={hashparams} />, document.getElementById('root'));