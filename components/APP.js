var React = require('react');
var io = require('socket.io-client');
var Header = require('./parts/Header');

var App = React.createClass({

	getInitialState() {
		return {
			status: 'disconnected'
		}
	},
	
	componentWillMount() {
		this.socket = io('http://localhost:3000');
		alert('here!')
		this.socket.on('connect', this.connect);
	},

	connect() {
		this.setState({
			status: 'connected'
		});
	},

	render() {
		return (
			<div>
				<Header title="New Header" status={this.state.status} />
			</div>
			);
	}
})

module.exports = App
