// import { books } from './data/books.js';
import _ from 'lodash';
import express from 'express';
import { gql } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { textSpanContainsPosition } from 'typescript';

const books = [
  {name: 'Name of the Wind', genre: 'Fantasy', id: 1},
  {name: 'The Final Empire', genre: 'Fantasy', id: 2},
  {name: 'The Long Earth', genre: 'Sci-Fi', id: 3},
];    

const PORT = 4000;
const pubsub = new PubSub();

const typeDefs = gql`
  type Book {
    id: Int
    name: String
    genre: String
  }

  type Query {
    book(id: ID!): Book
    allBooks: [Book]
  }

  type Subscription {
    numberIncremented: Int
    bookAdded: Book
  }
`;

const resolvers = {
  Query: {
    book: (parent, args) => _.find(books, {id: args.id}),
    allBooks: () => books,
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"])
    },
    numberIncremented: {
      subscribe: () => pubsub.asyncIterator(["NUMBER_INCREMENTED"]),
    },
  }
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

httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}${server.graphqlPath}`);
});

let i = 0;
const incrementNumber = () => {
    i++;
    pubsub.publish("NUMBER_INCREMENTED", { numberIncremented: i });
    setTimeout(incrementNumber, 2000);
}
const addBook = () => {
  const book = {
    id: i,
    name: 'testName',
    genre: 'testGenre'
  };
  i++;
  console.log(book);
  pubsub.publish('BOOK_ADDED', { bookAdded: book });
  setTimeout(addBook, 2000);
}

addBook();