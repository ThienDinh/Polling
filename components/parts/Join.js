import React from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'

class Join extends React.Component{
	constructor(){
		super();
		this.join = this.join.bind(this);
	}
	join(){
		// Find a Node in React DOM.
		var memberName = ReactDOM.findDOMNode(this.refs.name).value;
		// Emit the custom event back to the server.
		// The 'emit' property is passed down from App.
		this.props.emit('join', {
			name: memberName
		});
	}

	render() {
		return (
			<form action='javascript:void(0)' onSubmit={this.join}>

				<label>Full Name</label>
				<input
					ref='name'
					className='form-control'
					placeholder='enter your full name...'
					required />
				<button className='btn btn-primary'>Join</button>
				<Link to='/speaker'>Start the Presentation</Link>
				<Link to='/board'>Go to the Board</Link>
			</form>
			);
	}
}

module.exports = Join;