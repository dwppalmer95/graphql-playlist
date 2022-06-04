import { gql, useQuery } from "@apollo/client";

const GET_BOOKS = gql`
  {
    allBooks {
      id
      name
      genre
    }
  }
`;



function BookList() {
  const { data, loading } = useQuery(GET_BOOKS);
  const displayBooks = () => {
    if (loading) {
      return (<div>Loading...</div>)
    } else {
      console.log(data.allBooks);
      return data.allBooks.map(book => {
        return (<li key={book.id}>{book.name}</li>)
      });
    }
  }
  return (
    <div id="main">
      Book name
      { displayBooks() }
    </div>
  );
}

export default BookList;