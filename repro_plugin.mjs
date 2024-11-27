import {
    gql,
    makeExtendSchemaPlugin,
} from 'postgraphile/utils'
import { constant,  } from 'postgraphile/grafast'


export const ReproPlugin = makeExtendSchemaPlugin((build) => {
    const { posts } = build.input.pgRegistry.pgResources
    const { sql } = build
    return {
      typeDefs: gql`
        extend type Post {
          repro: Post
        }
      `,
      plans: {
        Post: {
          repro($post) {
            const $posts = posts.find()
            const postsTbl = $posts.alias
            $posts.where(sql`
              ${postsTbl}.id
                 = ${$post.getClassStep().alias}.id
            `)
            const $one = constant(1)
            $posts.setFirst($one)
            return $posts.single()
          },
        },
      },
    }
  })