import { ApolloServer } from 'apollo-server';

import schema from './schema';
import { context } from './context';

const server = new ApolloServer({
  schema,
  context,
});

const port = 3000;

server.listen({ port }).then(({ url }: {url: string}) => {
  // eslint-disable-next-line no-console
  console.log(`🚀  Server ready at ${url}`);
});

export default server;
