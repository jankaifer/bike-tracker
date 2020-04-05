import React from "react";
import { observer } from "mobx-react";
import { List, Button, Icon, Segment, Input } from "semantic-ui-react";
import store from "./Store";

type Props = {
  track: Track;
};

const TrackSettings = ({ track }: Props) => {
  const color = store.getTrackColor(track.id);

  return (
    <Segment
      style={{
        borderTop: `2px solid ${color}`,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <List horizontal>
        <List.Item>
          <p>{track.name}</p>
        </List.Item>
        <List.Item>
          <Input
            label="Offset in seconds"
            labelPosition="left corner"
            type="number"
            val={`${store.tracksById[track.id].timeOffset / 1000}`}
            onChange={(e) => {
              store.tracksById[track.id].timeOffset = +e.target.value * 1000;
            }}
          ></Input>
        </List.Item>
        <List.Item>
          <Button icon negative onClick={() => store.removeTrack(track.id)}>
            <Icon name="trash" />
          </Button>
        </List.Item>
      </List>
    </Segment>
  );
};

export default observer(TrackSettings);
