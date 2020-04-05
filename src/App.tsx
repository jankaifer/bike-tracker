import "./App.css";

import { toJS } from "mobx";
import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Map, CircleMarker, Polyline, TileLayer } from "react-leaflet";
import { Segment } from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";

import AddTrack from "./AddTrack";
import store from "./Store";

const stringToColour = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

const getColor = (id: string, index: number) => {
  const niceColors = [
    "#CC0000",
    "#FF8000",
    "#FFFF00",
    "#00FF00",
    "#0080FF",
    "#7F00FF",
    "#FF00FF",
    "#663300",
  ];

  if (index < niceColors.length) {
    return niceColors[index];
  } else {
    return stringToColour(id);
  }
};

function App() {
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
          <p>Number of tracks: {store.tracks.length}</p>
        </Segment>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          zIndex: 1000,
        }}
      >
        <Segment>
          <Slider
            value={store.currentTime}
            settings={{
              min: 0,
              max: store.maxTime,
              step: 1,
              onChange: (value: number) => {
                store.currentTime = value;
              },
            }}
          />
        </Segment>
      </div>
      <Map center={[49.75618698634207, 13.303053053095937]} zoom={15}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {store.tracks.map((track, i) => (
          <>
            <Polyline
              key={track.id}
              color={getColor(track.id, i)}
              positions={track.positions.map(
                (trackpoint) =>
                  [trackpoint.latitude, trackpoint.longitude] as [
                    number,
                    number
                  ]
              )}
            />
            {store.getCurrentPoint(track.id) && (
              <CircleMarker
                center={store.getCurrentPoint(track.id) as [number, number]}
                color={getColor(track.id, i)}
                radius={20}
              />
            )}
          </>
        ))}
      </Map>
    </div>
  );
}

export default observer(App);
