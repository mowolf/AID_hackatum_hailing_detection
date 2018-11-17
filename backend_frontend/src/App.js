import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
// import { init } from "./actions";

const Background = styled.div`
  background-color: #ecf0f1;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

class App extends Component {
  onChange = e => {
    this.props.test(e.target.value);
  };

  render() {
    const carStatuses = this.props.carStatuses;
    return <Background>{JSON.stringify(carStatuses)}</Background>;
  }
}

const mapStateToProps = state => {
  return {
    carStatuses: state.carStatuses
  };
};

export default connect(mapStateToProps, {})(App);
