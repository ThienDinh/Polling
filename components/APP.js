var React = require('react');
var io = require('socket.io-client');
var Header = require('./parts/Header');

var App = React.createClass({

	getInitialState() {
		// member refers to user using socket.
		return {
			status: 'disconnected',
			title: '',
			member: {},
			audience: [],
			speaker: ''
		}
	},
	
	componentWillMount() {
		this.socket = io('http://localhost:3000');
		this.socket.on('connect', this.connect);
		this.socket.on('disconnect', this.disconnect);
		this.socket.on('welcome', this.updateState);
		this.socket.on('joined', this.joined);
		// called when a new audience has joined.
		this.socket.on('audience', this.updateAudience);
		this.socket.on('start', this.start);
		this.socket.on('end', this.updateState);
	},

	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	},

	connect() {
		var member = (sessionStorage.member) ?
			JSON.parse(sessionStorage.member) :
			null;

		if (member && member.type === 'audience') {
			this.emit('join', member);
		} else if (member && member.type === 'speaker') {
			this.emit('start', {
				name: member.name,
				title: sessionStorage.title
			});
		}

		this.setState({
			status: 'connected'
		});
	},

	disconnect() {
		this.setState({
			status: 'disconnected',
			title: 'disconnected',
			speaker: ''
		});
	},

	updateState(serverState) {
		this.setState(serverState);
	},

	start(presentation){
		if (this.state.member.type === 'speaker') {
			sessionStorage.title = presentation.title;
		}
		this.setState(presentation);
	},

	joined(member){
		// Save the current member into browser's session storage.
		sessionStorage.member = JSON.stringify(member);
		this.setState({
			member: member
		});
	},

	updateAudience(newAudience) {
		this.setState({audience: newAudience});
	},

	render() {
		return (
			<div>
				<Header {...this.state} />
				{React.cloneElement(this.props.children, {...this.state, emit: this.emit})}
			</div>
			);
	}
})

module.exports = App
