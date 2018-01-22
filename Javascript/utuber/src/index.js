import React, {Component} from 'react';
import ReactDom from 'react-dom';
import Utuber from './components/UTuber';

const APIKEY = 'AIzaSyBw6sk1LNjxVCYNTTDVnDcn3ouWhzKDTYM';

ReactDom.render(<Utuber apikey={APIKEY} />, document.getElementById('root'));