import { observer } from "mobx-react";
import React from "react";
import { List, Icon } from "semantic-ui-react";
import { CircleMarker, Polyline, Popup } from "react-leaflet";
import { FaMountain } from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";
import store from "./Store";

type Props = {
  track: Track;
  index: number;
};

const Track = ({ track, index }: Props) => {
  const color = store.getTrackColor(track.id);
  const currentPosition = store.getCurrentPoint(track.id);

  return (
    <>
      <Polyline
        color={color}
        positions={track.positions.map(
          (trackpoint) =>
            [trackpoint.latitude, trackpoint.longitude] as [number, number]
        )}
      />
      {currentPosition && (
        <CircleMarker
          center={[currentPosition.latitude, currentPosition.longitude]}
          color={color}
          radius={10}
        >
          <Popup>
            <List>
              <List.Item>
                <Icon name="heart" />
                <List.Content>
                  {Math.round(currentPosition.heartrate)}
                </List.Content>
              </List.Item>
              <List.Item>
                <i className="icon">
                  <FaMountain />
                </i>
                <List.Content>
                  {Math.round(currentPosition.elevation)} m
                </List.Content>
              </List.Item>
              <List.Item>
                <i className="icon">
                  <IoMdSpeedometer />
                </i>
                <List.Content>
                  {Math.round(currentPosition.speed * 36) / 10} km/h
                </List.Content>
              </List.Item>
            </List>
          </Popup>
        </CircleMarker>
      )}
    </>
  );
};

export default observer(Track);
