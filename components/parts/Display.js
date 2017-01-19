import React from 'react'

class Display extends React.Component{
	render() {
		return (this.props.if) ? <div>{this.props.children}</div> : null;
	}
}

module.exports = Display;