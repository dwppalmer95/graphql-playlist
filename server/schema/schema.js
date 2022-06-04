const graphql = require('graphql');
const _ = require('lodash');
const books = require('../data/books');

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLList
 } = graphql;

const BookType = new GraphQLObjectType({
   name: 'Book',
   fields: () => ({
     id: {type: GraphQLID},
     name: {type: GraphQLString},
     genre: {type: GraphQLString}
   })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: BookType,
      args: {id: {type: GraphQLString}},
      resolve(parent, args) {
        return _.find(books, {id: args.id});
      }
    },
    allBooks: {
      type: GraphQLList(BookType),
      resolve() {
        return books;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});