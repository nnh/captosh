declare module 'electron-connect' {
  type ProcessManager = {
    // TODO: FIXME
    start: () => void;
    restart: () => void;
    reload: () => void;
  };
  type ServerType = {
    create: () => ProcessManager;
  }
  export const server: ServerType;
}
