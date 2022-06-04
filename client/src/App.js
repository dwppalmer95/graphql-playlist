import BookList from "./components/BookList";
import { ApolloClient } from "@apollo/client";
import { ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div id="main">
        <BookList/>
      </div>
    </ApolloProvider>
  );
}

export default App;
