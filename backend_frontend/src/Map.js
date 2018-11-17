import React, { Component } from "react";
import { Map, TileLayer, Circle, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import { connect } from "react-redux";
import "leaflet/dist/leaflet.css";
import "./leaflet.css";

Leaflet.Icon.Default.imagePath =
  "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/";

class MyMap extends Component {
  state = {
    lat: 48.1347975,
    lng: 11.5424506,
    zoom: 13
  };

  render() {
    const carStates = this.props.carStates;
    const position = [this.state.lat, this.state.lng];
    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {carStates.length &&
          carStates.map(carState => {
            return carState ? (
              <Circle
                center={carState.pos}
                radius={100}
                opacity={1}
                fillOpacity={1}
                stroke={false}
                key={carState.carId}
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
              </Circle>
            ) : null;
          })}
      </Map>
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
)(MyMap);
