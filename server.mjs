import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

const typeDefs = await loadSchema('./schema.gql', {
  loaders: [new GraphQLFileLoader()],
});

const items = [
  { id: '5f9d88b9d4c6d4b1f0a9d6a1', name: 'Item Alpha' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a2', name: 'Item Beta' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a3', name: 'Item Gamma' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a4', name: 'Item Delta' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a5', name: 'Item Epsilon' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a6', name: 'Item Zeta' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a7', name: 'Item Eta' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a8', name: 'Item Theta' },
  { id: '5f9d88b9d4c6d4b1f0a9d6a9', name: 'Item Iota' },
  { id: '5f9d88b9d4c6d4b1f0a9d6aa', name: 'Item Kappa' },
];

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    items: (parent, args, contextValue, info) => {
      if (args.first != null && args.last != null)
        throw new Error('Both `first` and `last` cannot be defined');
      if (args.first == null && args.last == null)
        throw new Error('Either `first` or `last` must be defined');

      if (args.first != null) {
        const first = Math.max(Math.min(args.first, 10), 0);
        const id =
          Buffer.from(args.after || '', 'base64').toString('ascii') ||
          '000000000000000000000000';

        const startIndex = items.findIndex((item) => item.id > id);
        const nodes = items.slice(startIndex, startIndex + first);

        return {
          nodes,
          pageInfo: {
            hasPreviousPage: nodes[0]?.id !== items[0].id,
            hasNextPage: nodes.at(-1)?.id !== items.at(-1).id,
            startCursor: nodes[0]
              ? Buffer.from(nodes[0].id).toString('base64')
              : null,
            endCursor:
              nodes.length > 0
                ? Buffer.from(nodes.at(-1).id).toString('base64')
                : null,
            total: items.length,
          },
        };
      } else if (args.last != null) {
        const last = Math.max(Math.min(args.last, 10), 0);
        const id =
          Buffer.from(args.before || '', 'base64').toString('ascii') ||
          '000000000000000000000000';

        const endIndex = items.findIndex((item) => item.id > id);
        const nodes = reversedItems.slice(
          Math.max(0, endIndex - last),
          endIndex
        );

        return {
          nodes,
          pageInfo: {
            hasPreviousPage: nodes.at(-1)?.id !== items.at(-1).id,
            hasNextPage: nodes[0]?.id !== items[0].id,
            startCursor: nodes[0]
              ? Buffer.from(nodes[0].id).toString('base64')
              : null,
            endCursor:
              nodes.length > 0
                ? Buffer.from(nodes.at(-1).id).toString('base64')
                : null,
            total: items.length,
          },
        };
      }
    },
  },
  Mutation: {
    removeItem: (parent, args, contextValue, info) => {
      const index = items.findIndex((item) => item.id === args.id);
      if (index === -1) return null;

      const [item] = items.splice(index, 1);
      return item?.id;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);
