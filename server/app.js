const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./schema/schema');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server');
const books = require('../data/books');

const typedefs = gql`
  type Book {
    id: ID
    name: String
    genre: String
  }

  type Query {
    book: Book
    allBooks: [Book]
  }
`;

const resolvers = {
  Query: {
    books: _.find(books, {id: args.id}),
  },
}

const app = express();

app.use(cors());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

const port = 4000;
app.listen(port, () => console.log(`Listening for requests on port ${port}`));