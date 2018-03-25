//
//  Data querying facilities
//
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hey: {
        type: GraphQLString,
        resolve({ user }) {
          return 'ay yo'
        },
      },
    },
  }),
})

export default function resolveQuery(query, context = {}) {
  return graphql(schema, query, /* rootValue: */null, /* contextValue: */ context)
}
