import { observer } from "mobx-react";
import React, { useState } from "react";
import { Map, TileLayer } from "react-leaflet";
import { Slider } from "react-semantic-ui-range";
import { Segment, Button, Popup, Form, Icon, Modal } from "semantic-ui-react";
import AddTrack from "./AddTrack";
import "./App.css";
import store from "./Store";
import Track from "./Track";
import TrackSettings from "./TrackSettings";
import FileRenamer from "./FineRenamer";

function App() {
  let seconds = ~~(store.currentTime / 1000);
  let minutes = ~~(seconds / 60);
  seconds %= 60;
  let hours = ~~(minutes / 60);
  minutes %= 60;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAligningTracks, setIsAligningTracks] = useState(false);

  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: "calc(100vw - 100px)",
          overflow: "auto",
        }}
      >
        <Segment>
          {store.tracks.map((track) => (
            <TrackSettings key={track.id} track={track} />
          ))}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => setIsAligningTracks((v) => !v)}
              basic={!isAligningTracks}
            >
              <Icon name="crosshairs" /> Align Tracks
            </Button>
            <AddTrack />
          </div>
        </Segment>
      </div>
      {store.tracks.length && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <Segment style={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => {
                store.autoIncrement = !store.autoIncrement;
              }}
              basic
            >
              {store.autoIncrement ? "Stop" : "Play"}
            </Button>
            <Popup
              trigger={
                <Button
                  basic={!isSettingsOpen}
                  size="mini"
                  circular
                  icon="setting"
                />
              }
              open={isSettingsOpen}
              onOpen={() => setIsSettingsOpen(true)}
              onClose={() => setIsSettingsOpen(false)}
              on="click"
              content={
                <Form>
                  <Form.Input
                    label="Animation speed"
                    type="number"
                    value={store.autoIncrementSpeed / 1000}
                    min="1"
                    onChange={(e) => {
                      store.autoIncrementSpeed = +e.target.value * 1000;
                    }}
                  />
                </Form>
              }
            />
            <span style={{ width: "100px" }}>
              {hours}:{minutes}:{seconds}
            </span>
            <div style={{ flexGrow: 1 }}>
              <Slider
                value={store.currentTime}
                settings={{
                  min: 0,
                  max: store.maxTime,
                  step: 1,
                  onChange: (value: number) => {
                    if (Math.abs(value - store.currentTime) > 1000 * 60)
                      store.autoIncrement = false;
                    store.currentTime = value;
                  },
                }}
              />
            </div>
            <FileRenamer />
          </Segment>
        </div>
      )}
      <Map
        center={[49.75618698634207, 13.303053053095937]}
        zoom={15}
        onClick={(e: any) => {
          const position = e.latlng;
          if (isAligningTracks) {
            store.alignTracks(position);
            store.autoIncrement = false;
            setIsAligningTracks(false);
          }
        }}
        style={isAligningTracks ? { cursor: "crosshair" } : {}}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {store.tracks.map((track, i) => (
          <Track track={track} index={i} />
        ))}
      </Map>
    </div>
  );
}

export default observer(App);
