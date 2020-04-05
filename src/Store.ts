import { observable, action, computed } from "mobx";
import { v4 as uuid } from "uuid";

type RawTrack = {
  text: string;
  id: string;
};

type Position = {
  time: number;
  lat: number;
  lng: number;
};

type Track = {
  id: string;
  positions: Position[];
};

const parseGPX = (data: string) => {
  return [];
};

class Store {
  @observable rawTracks: RawTrack[] = [];

  @action addTrack = (track: string) =>
    this.rawTracks.push({ id: uuid(), text: track });

  @computed get tracks() {
    return this.rawTracks.map((rawTrack) => ({
      id: rawTrack.id,
      positions: parseGPX(rawTrack.text),
    }));
  }
}

export default new Store();
