import { observable, action } from "mobx";
import { v4 as uuid } from "uuid";

type RawTrack = {
  text: string;
  id: string;
};

class Store {
  @observable tracks: RawTrack[] = [];

  @action addTrack = (track: string) =>
    this.tracks.push({ id: uuid(), text: track });
}

export default new Store();
