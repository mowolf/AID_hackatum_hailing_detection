import React, { Component } from "react";
import styled from "styled-components";

import Map from "./Map";
import Stats from "./Stats";

const Background = styled.div`
  background-color: #ecf0f1;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  font-family: Sans;
  color: #2c3e50;
`;

const MapWrapper = styled.div`
  position: relative;
  flex: 2;
`;

const StatsWrapper = styled.div`
  background-color: #95a5a6;
  flex: 1;
  padding: 10px;
`;

export default class App extends Component {
  onChange = e => {
    this.props.test(e.target.value);
  };

  render() {
    return (
      <Background>
        <MapWrapper>
          <Map />
        </MapWrapper>
        <StatsWrapper>
          <Stats />
        </StatsWrapper>
      </Background>
    );
  }
}
