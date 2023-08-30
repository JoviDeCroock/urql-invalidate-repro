import { Client, fetchExchange } from 'urql';
import {
  KeyingConfig,
  OptimisticMutationConfig,
  UpdatesConfig,
  cacheExchange
} from '@urql/exchange-graphcache';

const keys: KeyingConfig = { PaginatedItems: () => null };

const updates: UpdatesConfig = {
  Mutation: {
    removeItem: (
      result: { removeItem: string },
      args: { id: string },
      cache
    ) => {
      if (result.removeItem) {
        console.log('Running update');
        cache.invalidate({ __typename: 'Item', id: args.id });
      }
    },
  },
};

const optimistic: OptimisticMutationConfig = {
  removeItem: (args: { id: string }) => args.id,
};

const client = new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      keys,
      updates,
      optimistic,
    }),
    fetchExchange,
  ],
});

export { client };
