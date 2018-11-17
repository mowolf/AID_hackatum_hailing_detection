import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
`;

const Tr = styled.tr`
  border-bottom: 1px solid #2c3e50;
`;

class CarStateTable extends Component {
  render() {
    const numbers = {
      FREE: 0,
      BUSY: 0,
      CHARGING: 0,
      ERROR: 0,
      MAINTENANCE: 0,
      APPROACHING: 0
    };

    for (let carState of this.props.carStates) {
      if (Object.keys(numbers).includes(carState.state)) {
        numbers[carState.state] += 1;
      }
    }

    return (
      <div>
        <h2>Car States</h2>
        <Table>
          <tbody>
            {Object.keys(numbers).map((key, index) => (
              <Tr key={index}>
                <td>{key.toLowerCase()}</td>
                <td>{numbers[key]}</td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
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
)(CarStateTable);
