import React from "react";
import styled from "styled-components";
import CarStateTable from './CarStateTable';
import DistanceTravelledPlot from './DistanceTravelledPlot';

const RedCircle = styled.span`
    width: 1em;
    height: 1em;
    display: inline-block;
    border-radius: 50%;
    background-color: #e74c3c;
    margin-right: .5em;
`;
const BlueCircle = styled.span`
    width: 1em;
    height: 1em;
    display: inline-block;
    border-radius: 50%;
    background-color: #2980b9;
    margin-right: .5em;
`;

export default (props) => {
    return [
        <div key={0}>
            <h2>Legend</h2>
            <p><RedCircle />Passengers</p>
            <p><BlueCircle />Cars</p>
        </div>,
        <CarStateTable key={1} />,
        <DistanceTravelledPlot key={2} />
    ]
}