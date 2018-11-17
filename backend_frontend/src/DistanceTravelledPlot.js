import React, { Component } from "react";
import Plot from "react-plotly.js";
import styled from "styled-components";

const Wrapper = styled.div`
  margin-top: 20px;
`;

const PlotWrapper = styled.div`
  height: 300px;
  width: 100%;
  overflow: hidden;
  justify-content: center;
  display: flex;
`;

class DistanceTravelledPlot extends Component {
  render() {
    return (
      <Wrapper>
        <h2>Distance Travelled</h2>
        <PlotWrapper>
          <Plot
            data={[{ type: "bar", x: ["yesterday", "today"], y: [1374, 1021] }]}
            layout={{
              width: 300,
              height: 300,
              margin: { l: 40, r: 20, p: 0, t: 20, b: 20 }
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </PlotWrapper>
      </Wrapper>
    );
  }
}

export default DistanceTravelledPlot;
