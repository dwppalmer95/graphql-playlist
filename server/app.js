const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./schema/schema');
const cors = require('cors');
const { ApolloServer, gql } = require('apollo-server');
const books = require('./data/books.js');
const _ = require('lodash');

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
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
});

server.listen().then(({ url }) => console.log(`Server listening at ${url}`));