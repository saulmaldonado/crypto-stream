import { DocumentNode } from 'graphql';

export type StringOrAst = string | DocumentNode;

export type Query = {
  query: StringOrAst;
  mutation?: undefined;
  variables?: {
    [name: string]: any;
  };
  operationName?: string;
};
export type Mutation = {
  mutation: StringOrAst;
  query?: undefined;
  variables?: {
    [name: string]: any;
  };
  operationName?: string;
};
