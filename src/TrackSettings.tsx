import React, { useState } from "react";
import { observer } from "mobx-react";
import { List, Button, Icon, Segment, Input } from "semantic-ui-react";
import { FaMountain } from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";
import store from "./Store";

type Props = {
  track: Track;
};

const TrackSettings = ({ track }: Props) => {
  const color = store.getTrackColor(track.id);
  const currentPosition = store.getCurrentPoint(track.id);
  const [isEditing, setIsEditing] = useState(false);
  const timeOffset = Math.round(store.tracksById[track.id].timeOffset / 1000);
  const safe = (fnc: (pc: TrackPoint) => React.ReactNode) =>
    currentPosition ? fnc(currentPosition) : "--";

  return (
    <Segment
      style={{
        borderTop: `2px solid ${color}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <label
        style={{
          position: "absolute",
          top: 0,
          left: 10,
          fontSize: ".8em",
          fontWeight: "bold",
        }}
      >
        {track.name}
      </label>
      <List horizontal style={{ display: "flex" }}>
        {isEditing ? (
          <List.Item>
            <Input
              label="Offset in seconds"
              labelPosition="left corner"
              type="number"
              value={timeOffset}
              onChange={(e) => {
                store.tracksById[track.id].timeOffset = +e.target.value * 1000;
              }}
            ></Input>
          </List.Item>
        ) : (
          <List.Item>
            <List horizontal divided>
              <List.Item style={{ width: 60, textAlign: "left" }}>
                <List.Content>
                  <Icon name="heart" />
                  {safe((cp) => Math.round(cp.heartrate))}
                </List.Content>
              </List.Item>
              <List.Item style={{ width: 80, textAlign: "left" }}>
                <List.Content>
                  <i className="icon">
                    <FaMountain />
                  </i>
                  {safe((cp) => Math.round(cp.elevation))} m
                </List.Content>
              </List.Item>
              <List.Item style={{ width: 100, textAlign: "left" }}>
                <List.Content>
                  <i className="icon">
                    <IoMdSpeedometer />
                  </i>
                  {safe((cp) => Math.round(cp.speed * 3.6))} km/h
                </List.Content>
              </List.Item>
            </List>
          </List.Item>
        )}
        <div style={{ flexGrow: 1, display: "inline-block" }} />
        <List.Item>
          <Button
            basic={!isEditing}
            size="mini"
            circular
            icon="setting"
            onClick={() => setIsEditing((v) => !v)}
          />
        </List.Item>
        <List.Item>
          <Button
            icon="trash"
            negative
            basic
            size="mini"
            circular
            onClick={() => store.removeTrack(track.id)}
          />
        </List.Item>
      </List>
    </Segment>
  );
};

export default observer(TrackSettings);
