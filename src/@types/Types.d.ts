declare type RawTrack = {
  text: string;
  id: string;
};

declare type TrackPoint = {
  elevation: number;
  latitude: number;
  longitude: number;
  relativeTime: number;
  timestamp: number;
  heartrate: number;
};

declare type Track = {
  name: string;
  id: string;
  positions: TrackPoint[];
  startTime: number;
  endTime: number;
  timeOffset: number;
};

declare module "xml2js";
declare module "parse-gpx/src/parseTrack";
declare module "react-semantic-ui-range";
