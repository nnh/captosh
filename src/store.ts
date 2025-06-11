export interface GlobalState {
  isPrintingDateTime: boolean;
  isPrintingURL: boolean;
  outputDirectory: string;
}

export type GlobalStateKey = keyof GlobalState;

class Store {
  private state: GlobalState;

  constructor() {
    this.state = {
      isPrintingDateTime: false,
      isPrintingURL: false,
      outputDirectory: '',
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
