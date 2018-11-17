import React, { Component } from "react";
import styled from "styled-components";
import CarStateTable from './CarStateTable';
import DistanceTravelledPlot from './DistanceTravelledPlot';

export default (props) => {
    return [
        <CarStateTable key={0} />,
        <DistanceTravelledPlot key={1} />
    ]
}