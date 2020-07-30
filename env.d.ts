declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      CONNECTION_STRING?: string;
      AUTH0_DOMAIN?: string;
      AUTH0_CLIENT_ID?: string;
      AUTH0_CLIENT_SECRET?: string;
      AUTH0_CONNECTION?: string;
      AUTH0_AUDIENCE?: string;
    }
  }
}

export {};
