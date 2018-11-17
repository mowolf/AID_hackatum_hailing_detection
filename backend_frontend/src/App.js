import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
// import { init } from "./actions";
import Map from "./Map";

const Background = styled.div`
  background-color: #ecf0f1;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
`;

const MapWrapper = styled.div`
  position: relative;
  padding: 10px;
  flex: 2;
`;

const Stats = styled.div`
  background-color: red;
  flex: 1;
  padding: 10px;
`;

class App extends Component {
  onChange = e => {
    this.props.test(e.target.value);
  };

  render() {
    const carStates = this.props.carStates;
    return (
      <Background>
        <MapWrapper>
          <Map />
        </MapWrapper>
        <Stats>Stats</Stats>
      </Background>
    );
  }
}

const mapStateToProps = state => {
  return {
    carStates: state.carStates
  };
};

export default connect(
  mapStateToProps,
  {}
)(App);
