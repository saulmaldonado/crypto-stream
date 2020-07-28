declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      CONNECTION_STRING?: string;
    }
  }
}

export {};
