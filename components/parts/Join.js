var React = require('react');
var ReactDOM = require('react-dom');

var Join = React.createClass({
	join(){
		// Find a Node in React DOM.
		var memberName = ReactDOM.findDOMNode(this.refs.name).value;
		// Emit the custom event back to the server.
		// The 'emit' property is passed down from App.
		this.props.emit('join', {
			name: memberName
		});
	},

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

			</form>
			);
	}
});

module.exports = Join;