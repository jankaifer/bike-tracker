import "./App.css";

import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Map, Marker, Polyline, TileLayer } from "react-leaflet";
import { Segment } from "semantic-ui-react";

import AddTrack from "./AddTrack";
import store from "./Store";

function App() {
  // const [lat, setLat] = useState(50.0666);
  // const [lng, setLng] = useState(14.853);
  // const [zoom, setZoom] = useState(19);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 1000 }}>
        <Segment>
          <AddTrack />
          <p>Number of tracks: {store.rawTracks.length}</p>
        </Segment>
      </div>
      <Map center={[50.0666, 14.853]} zoom={19}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline color="lime" positions={[]} />
      </Map>
    </div>
  );
}

export default observer(App);
