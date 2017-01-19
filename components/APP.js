import React from 'react'
import io from 'socket.io-client'
import Header from './parts/Header'

// App component handles all the interactions between
// the client app and the server socket events.
class App extends React.Component{
	// Set the initial state of the App component.
	constructor(){
		super();
		// member refers to user using socket.
		this.state = {
			status: 'disconnected',
			title: '',
			member: {},
			audience: [],
			speaker: '',
			questions: [],
			currentQuestion: false,
			results: {}
		};
		this.emit = this.emit.bind(this);
	}
	// Before mounting the component, check for
	// the socket events.
	componentWillMount() {
		this.socket = io('http://localhost:3000');
		// This handler is called when the client and the server has
		// established a socket connection.
		this.socket.on('connect', () => {
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
		});

		// This handler is called when the socket between the server
		// and the client has lost.
		this.socket.on('disconnect', () => {
			this.setState({
				status: 'disconnected',
				title: 'disconnected',
				speaker: ''
			});
		});

		// This handler is called when the welcome or the end event is emitted by the server.
		this.socket.on('welcome', (serverState) => {
			this.setState(serverState);
		});

		// This handler is called after the server receives the client request, emitted by the event 'join'.
		this.socket.on('joined', (member) => {
			// Save the current member into browser's session storage.
			sessionStorage.member = JSON.stringify(member);
			this.setState({
				member: member
			});
		});

		// This handler is called when the audience list has been updated, which is emitted by the server.
		this.socket.on('audience', (newAudience) => {
			this.setState({audience: newAudience});
		});

		// This handler is called when the server emits the event start.
		this.socket.on('start', (presentation) => {
			if (this.state.member.type === 'speaker') {
				sessionStorage.title = presentation.title;
			}
			this.setState(presentation);
		});

		// This handler is called when the welcome or the end event is emitted by the server.
		this.socket.on('end', (serverState) => {
			this.setstate(serverState);
		});

		// This handler is invoked when the server emits the event 'ask',
		// indicating that the speaker has asked a question.
		this.socket.on('ask', (question) => {
			sessionStorage.answer= '';
			this.setState({
				currentQuestion: question
			});
		});

		this.socket.on('results', (data) => {
			this.setState({results: data});
		});
	}
	// This method is defined to be used by App's children.
	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	}	
	render() {
		return (
			<div>
				<Header {...this.state} />
				{React.cloneElement(this.props.children, {...this.state, emit: this.emit})}
			</div>
			);
	}
}

module.exports = App
