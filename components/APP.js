var React = require('react');
var io = require('socket.io-client');
var Header = require('./parts/Header');

// App component handles all the interactions between
// the client app and the server socket events.
var App = React.createClass({
	// Set the initial state of the App component.
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
	// Before mounting the component, check for
	// the socket events.
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
	// This method is defined to be used by App's children.
	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	},
	// This handler is called when the client and the server has
	// established a socket connection.
	connect() {
		// Check if the session storage still has the member variable.
		var member = (sessionStorage.member) ?
			JSON.parse(sessionStorage.member) :
			null;
		// Check if the member is not null and the type is 'audience'.
		if (member && member.type === 'audience') {
			//--- This member is an audience.
			// Emit the join event back to the server.
			this.emit('join', member);
		} else if (member && member.type === 'speaker') {
			//--- This member is a speaker.
			// Emit the start event back to the server.
			this.emit('start', {
				name: member.name,
				title: sessionStorage.title
			});
		}
		// Update the status.
		this.setState({
			status: 'connected'
		});
	},
	// This handler is called when the socket between the server
	// and the client has lost.
	disconnect() {
		this.setState({
			status: 'disconnected',
			title: 'disconnected',
			speaker: ''
		});
	},
	// This handler is called when the welcome or the end event is emitted by the server.
	updateState(serverState) {
		this.setState(serverState);
	},
	// This handler is called when the server emits the event start.
	start(presentation){
		if (this.state.member.type === 'speaker') {
			sessionStorage.title = presentation.title;
		}
		this.setState(presentation);
	},
	// This handler is called after the server receives the client request, emitted by the event 'join'.
	joined(member){
		// Save the current member into browser's session storage.
		sessionStorage.member = JSON.stringify(member);
		this.setState({
			member: member
		});
	},
	// This handler is called when the audience list has been updated, which is emitted by the server.
	updateAudience(newAudience) {
		this.setState({audience: newAudience});
	},
	// Render the App component and its appropriate children.
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
