import React, { Component } from "react";
import styled from 'styled-components'

const Background = styled.div`
  background-color: #ecf0f1;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`

class App extends Component {
  render() {
    return (
      <Background>
        Test
      </Background>
    );
  }
}

export default App;
