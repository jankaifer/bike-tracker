import { observer } from "mobx-react";
import React from "react";
import { CircleMarker, Polyline } from "react-leaflet";
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
        <CircleMarker center={currentPosition} color={color} radius={10} />
      )}
    </>
  );
};

export default observer(Track);
