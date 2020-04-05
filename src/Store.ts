import { toJS, observable, action, computed, autorun } from "mobx";
import { v4 as uuid } from "uuid";
import parseTrack from "parse-gpx/src/parseTrack";
import xml2js from "xml2js";
import dayjs from "dayjs";
import Cookies from "js-cookie";

const avg = (a: number, b: number, aw: number, bw: number) =>
  aw === 0 ? b : (a * aw + b * bw) / (aw + bw);

const convertToTrackPoint = (data: any) =>
  ({
    latitude: +data.latitude,
    longitude: +data.longitude,
    heartrate: +data.heartrate,
    elevation: +data.elevation,
    timestamp: dayjs(data.timestamp).valueOf(),
  } as Partial<TrackPoint>);

const parseGPX = async (data: string, id: string) => {
  const parser = new xml2js.Parser();
  const positions = (await new Promise((res, rej) =>
    parser.parseString(data, (err: any, xml: any) => {
      if (err) {
        rej(err);
      } else {
        res(parseTrack(xml.gpx.trk).map(convertToTrackPoint));
      }
    })
  )) as TrackPoint[];
  const startTime = Math.min(
    ...positions.map((position) => position.timestamp)
  );
  const endTime = Math.max(...positions.map((position) => position.timestamp));
  const relativePositions = positions.map(
    (position) =>
      ({
        ...position,
        ralativeTime: position.timestamp - startTime,
      } as TrackPoint)
  );

  return {
    id,
    positions: relativePositions,
    startTime,
    endTime,
    timeOffset: 0,
  };
};

class Store {
  @observable tracks: Track[] = [];
  @observable currentTime = 0;

  constructor() {
    const tracks = Cookies.get("tracks");
    if (tracks) this.tracks = tracks;

    const currentTime = Cookies.get("currentTime");
    if (currentTime) this.currentTime = currentTime;
  }

  @computed get maxTime() {
    return Math.max(
      ...this.tracks.map((track) => track.endTime - track.startTime)
    );
  }

  @action addTrack = async (track: string) =>
    this.tracks.push(await parseGPX(track, uuid()));

  getCurrentPoint = (id: string) => {
    const track = this.tracks.find(({ id: _id }) => _id === id);
    if (!track) throw new Error("id not found");

    const before = track.positions.filter(
      (point) => point.relativeTime <= this.currentTime
    )[0];
    const after = track.positions.filter(
      (point) => point.relativeTime >= this.currentTime
    )[0];

    if (!before || !after) return null;

    return [
      avg(
        before.latitude,
        after.latitude,
        Math.abs(after.relativeTime - this.currentTime),
        Math.abs(before.relativeTime - this.currentTime)
      ),
      avg(
        before.longitude,
        after.longitude,
        Math.abs(after.relativeTime - this.currentTime),
        Math.abs(before.relativeTime - this.currentTime)
      ),
    ];
  };
}

const store = new Store();

autorun((reaction) => {
  Cookies.set("currentTime", toJS(store.currentTime));
  reaction.dispose();
});

autorun((reaction) => {
  Cookies.set("tracks", toJS(store.tracks));
  reaction.dispose();
});

export default store;
