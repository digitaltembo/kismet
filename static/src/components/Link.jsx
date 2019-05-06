import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions/auth';
import { browserHistory } from 'react-router';

export default class Link extends React.Component { // eslint-disable-line react/prefer-stateless-function
  handleClick(event){
    event.preventDefault();
    browserHistory.push(this.props.href);
    if(this.props.onClick){
      this.props.onClick(event);
    }
  }
  render() {
    return (
      <a href={this.props.href} title={this.props.title} onClick={(event) => handleClick(event)}>
        {this.props.children}
      </a>
    );
  }
}
