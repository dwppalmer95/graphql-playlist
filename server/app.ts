import { books } from './data/books.js';
import _ from 'lodash';
import express from 'express';
import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

const typeDefs = gql`
  type Book {
    id: ID!
    name: String
    genre: String
  }

  type Query {
    book(id: ID!): Book
    allBooks: [Book]
  }
`;

const resolvers = {
  Query: {
    book: (parent, args) => _.find(books, {id: args.id}),
    allBooks: () => books,
  },
};

const app = express();
const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});
const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    }
  ]
});

await server.start();
server.applyMiddleware({ app });

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}${server.graphqlPath}`);
});