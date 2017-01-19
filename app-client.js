var React = require('react');
import {IndexRoute, Router, Route, hashHistory} from 'react-router';

var App = require('./components/App');
var ReactDOM = require('react-dom');
var Whoops404 = require('./components/Whoops404');

var Audience = require('./components/Audience');
var Speaker = require('./components/Speaker');
var Board = require('./components/Board');

/*
Always display the App component.
*/
var routes = (
	<Router history={hashHistory}>
		<Route component={App}>
			<Route path="/" component={Audience}/>
			<Route path='speaker' component={Speaker}/>
			<Route path='board' component={Board}/>
			<Route path='*' component={Whoops404}/>
		</Route>
	</Router>
);

// Render all the routes.
ReactDOM.render(routes, document.getElementById('react-container'));
