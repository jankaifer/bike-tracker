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

const toRad = (deg: number) => (deg * Math.PI) / 180;

const getPos = (position: TrackPoint) =>
  [position.latitude, position.latitude] as [number, number];

const computeDist = (
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
) => {
  const R = 6371e3; // metres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const computeSpeed = (pos1: TrackPoint, pos2: TrackPoint) => {
  const dist = computeDist(getPos(pos1), getPos(pos2));
  const timeDiff = (pos2.timestamp - pos1.timestamp) / 1000;
  return timeDiff > 0 ? dist / timeDiff : undefined;
};

const parseGPX = async (data: string, id: string, name: string) => {
  const parser = new xml2js.Parser();
  const [positions, trk] = await new Promise<[TrackPoint[], any]>((res, rej) =>
    parser.parseString(data, (err: any, xml: any) => {
      if (err) {
        rej(err);
      } else {
        res([parseTrack(xml.gpx.trk).map(convertToTrackPoint), xml.gpx.trk]);
      }
    })
  );
  const startTime = Math.min(
    ...positions.map((position) => position.timestamp)
  );
  const endTime = Math.max(...positions.map((position) => position.timestamp));
  const relativePositions = positions.map(
    (position, i) =>
      ({
        ...position,
        relativeTime: position.timestamp - startTime,
        speed: computeSpeed(
          positions[i - 1] || position,
          positions[i + 1] || position
        ),
      } as TrackPoint)
  );

  console.log(relativePositions);

  return {
    name: trk.name || name,
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

    const computeMiddle = (a: number, b: number) =>
      avg(
        a,
        b,
        Math.abs(after.relativeTime + track.timeOffset - this.currentTime),
        Math.abs(before.relativeTime + track.timeOffset - this.currentTime)
      );

    const computeProp = (prop: keyof typeof before & keyof typeof after) =>
      computeMiddle(before[prop], after[prop]);

    const outVal: TrackPoint = {
      elevation: computeProp("elevation"),
      latitude: computeProp("latitude"),
      longitude: computeProp("longitude"),
      heartrate: computeProp("heartrate"),
      relativeTime: computeProp("relativeTime"),
      timestamp: computeProp("timestamp"),
      speed: computeProp("speed"),
    };

    return outVal;
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
const FPS = 24;
setInterval(() => {
  if (store.autoIncrement) {
    store.currentTime = Math.min(
      store.currentTime + (SPEED * 1000) / FPS,
      store.maxTime
    );
  }
}, 1000 / FPS);

export default store;
