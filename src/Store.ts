import { observe, observable, action, computed } from "mobx";
import { v4 as uuid } from "uuid";
import parseTrack from "parse-gpx/src/parseTrack";
import xml2js from "xml2js";
import dayjs from "dayjs";

const storeVersion = 2;

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

const parseGPX = async (data: string, id: string, name: string) => {
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
        relativeTime: position.timestamp - startTime,
      } as TrackPoint)
  );

  return {
    name,
    id,
    positions: relativePositions,
    startTime,
    endTime,
    timeOffset: 0,
  };
};

class Store {
  @observable tracksById: { [key: string]: Track } = {};
  @observable currentTime = 0;
  @observable autoIncrement = false;

  @computed get tracks() {
    return Object.values(this.tracksById);
  }

  constructor() {
    if (
      JSON.parse(window.localStorage.getItem("storeVersion") || "-1") ===
      storeVersion
    ) {
      console.log("restoring");

      const tracksById = window.localStorage.getItem("tracksById");
      if (tracksById) this.tracksById = JSON.parse(tracksById);

      const currentTime = window.localStorage.getItem("currentTime");
      if (currentTime) this.currentTime = JSON.parse(currentTime);
    }
  }

  @computed get maxTime() {
    return Math.max(
      ...this.tracks.map((track) => track.endTime - track.startTime)
    );
  }

  @action addTrack = async (track: string, name: string) => {
    const id = uuid();
    this.tracksById[id] = await parseGPX(track, id, name);
  };

  @action removeTrack = (id: string) => {
    delete this.tracksById[id];
  };

  getCurrentPoint = (id: string) => {
    const track = this.tracks.find(({ id: _id }) => _id === id);
    if (!track) throw new Error("id not found");

    const before = track.positions
      .filter(
        (point) => point.relativeTime + track.timeOffset <= this.currentTime
      )
      .reverse()[0];
    const after = track.positions.filter(
      (point) => point.relativeTime + track.timeOffset >= this.currentTime
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
    ] as [number, number];
  };

  persist = () => {
    const tracksById = JSON.stringify(store.tracksById);
    const currentTime = JSON.stringify(store.currentTime);

    window.localStorage.setItem("tracksById", tracksById);
    window.localStorage.setItem("currentTime", currentTime);
    window.localStorage.setItem("storeVersion", JSON.stringify(storeVersion));
  };

  getTrackColor = (id: string) => {
    return getColor(
      id,
      (this.tracks
        .map((track, i) => [track.id, i] as [string, number])
        .find((pair) => pair[0] === id) || ["", Infinity])[1]
    );
  };
}

const store = new Store();

(window as any).persist = store.persist;

observe(store.tracksById, () => {
  store.persist();
});

const SPEED = 60;
const FPS = 10;
setInterval(() => {
  if (store.autoIncrement) {
    store.currentTime = Math.min(
      store.currentTime + (SPEED * 1000) / FPS,
      store.maxTime
    );
  }
}, 1000 / FPS);

export default store;
