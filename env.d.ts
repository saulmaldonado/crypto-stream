declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      CONNECTION_STRING?: string;
      AUTH0_DOMAIN?: string;
      AUTH0_CLIENT_ID?: string;
      AUTH0_CLIENT_SECRET?: string;
      AUTH0_API_SECRET?: string;
      AUTH0_CONNECTION?: string;
      AUTH0_AUDIENCE?: string;
      AUTH0_MANAGEMENT_AUDIENCE?: string;
      AUTH0_MANAGEMENT_SECRET?: string;
      AUTH0_MANAGEMENT_CLIENT_ID?: string;
      NOMICS_API_KEY?: string;
      API_KEY_SECRET?: string;
      AUTH0_API_ID?: string;
    }
  }
}

export {};
