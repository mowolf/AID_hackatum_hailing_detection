import React, { Component } from "react";
import { Map, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import { connect } from "react-redux";
import "leaflet/dist/leaflet.css";
import "./leaflet.css";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/";

class MyMap extends Component {
  state = {
    lat: 48.1288533,
    lng: 11.5811703,
    zoom: 13
  };

  render() {
    const carStates = this.props.carStates;
    const waitingPassengers = this.props.waitingPassengers;
    const position = [this.state.lat, this.state.lng];
    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png"
        />
        {carStates.length &&
          carStates.map((carState, index) => {
            return carState ? (
              <CircleMarker
                center={carState.pos}
                radius={10}
                opacity={1}
                fillOpacity={1}
                stroke={false}
                key={"car_" + index}
                fillColor={'#2980b9'}
              >
                <Popup>
                  <table>
                    <tbody>
                      <tr>
                        <td>state</td>
                        <td>{carState.state}</td>
                      </tr>
                      <tr>
                        <td>charge</td>
                        <td>{carState.batteryCharge.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Popup>
              </CircleMarker>
            ) : null;
          })}
          {waitingPassengers.length &&
          waitingPassengers.map((waitingPassenger, index) => {
            return waitingPassenger ? (
              <CircleMarker
                center={waitingPassenger.pos}
                radius={10}
                opacity={1}
                fillOpacity={1}
                stroke={false}
                key={"passenger_" + index}
                fillColor={'#e74c3c'}
              />
            ) : null;
          })}
      </Map>
    );
  }
}

const mapStateToProps = state => {
  return {
    carStates: state.carStates,
    waitingPassengers: state.waitingPassengers
  };
};

export default connect(
  mapStateToProps,
  {}
)(MyMap);
