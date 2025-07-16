export interface OutputResource {
  id: string;
  name: string;
  content: string;
}
export interface GlobalState {
  isPrintingDateTime: boolean;
  isPrintingURL: boolean;
  outputDirectory: string;
  resources: OutputResource[];
}

export type GlobalStateKey = keyof GlobalState;

class Store {
  private state: GlobalState;

  constructor() {
    this.state = {
      isPrintingDateTime: false,
      isPrintingURL: false,
      outputDirectory: '',
      resources: [],
    };
  }

  get<K extends GlobalStateKey>(key: K): GlobalState[K] {
    return this.state[key];
  }

  set<K extends GlobalStateKey>(key: K, value: GlobalState[K]): void {
    this.state[key] = value;
  }
}

export const store = new Store();
