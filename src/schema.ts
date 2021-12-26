import { makeSchema } from 'nexus';
import { join } from 'path';

import * as types from './graphql';

const schema = makeSchema({
  types,
  contextType: {
    module: join(__dirname, './context.ts'),
    export: 'Context',
  },
  outputs: {
    schema: join(__dirname, '..', 'schema.graphql'),
    typegen: join(__dirname, '..', 'nexus-typegen.ts'),
  },
});

export default schema;
