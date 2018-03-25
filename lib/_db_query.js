//
//  Subset of DB operations that is exposed to clients
//
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hey: {
        type: GraphQLString,
        resolve(obj, args, { user }) {
          return 'ay yo'
        },
      },
    },
  }),
})

export function query(expr, context = {}) {
  return graphql(schema, expr, context)
}
