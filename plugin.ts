import { applyTransforms, ConnectionStep, Step } from 'grafast';
import { TYPES, listOfCodec } from 'postgraphile/@dataplan/pg';
import { sql } from 'postgraphile/pg-sql2';
import { extendSchema, gql } from 'postgraphile/utils';

export const extensionsPlugin = extendSchema((build) => {
  const {
    input: { pgRegistry },
    grafast: { object, constant, each, get, connection, filter, lambda, coalesce, sideEffect },
  } = build;
  const { collection } = pgRegistry.pgResources;

  const DEFAULT_PAGE_SIZE = 24;

  return {
    typeDefs: gql`
      input Pagination {
        first: Int
        after: String
      }

      input ContentInput {
        pagination: Pagination!
      }

      interface RecommendationItem {
        id: String!
      }

      type MovieCollection implements RecommendationItem {
        id: String!
      }
      type SeriesCollection implements RecommendationItem {
        id: String!
      }

      type Recommendation {
        clusterId: String
        items: [RecommendationItem!]
        pageInfo: PageInfo
      }

      extend type Query {
        collectionRecommendation(
          collectionId: String!
          input: ContentInput!
        ): Recommendation!
      }
    `,
    interfaces: {
        RecommendationItem: {
            planType($specifier: Step<{ type: string }>) {
                const $type = get($specifier, 'type');
                const $__typename = lambda($type, recommendationTypeNameFromType, true);

                return {
                    $__typename,
                };
            },
        },
    },
    objects: {
      Query: {
        plans: {
          collectionRecommendation(_, { $collectionId, $input: { $pagination } }) {
            const $collection = collection.get({ id: $collectionId });
            const $items = get(get($collection, 'recommendations'), 'items');

            const $list = collection.find();
            $list.where(sql`
              ${$list.alias}.id = ANY (
                ARRAY(
                  SELECT DISTINCT
                    UNNEST (${$list.placeholder($items, listOfCodec(TYPES.text))})
                )
              )
            `);

            const $conn = connection($list);
            $conn.setFirst(coalesce(get($pagination, 'first'), constant(DEFAULT_PAGE_SIZE)));
            $conn.setAfter(get($pagination, 'after'));

            return object({
              clusterId: constant(''),
              __conn: $conn,
            });
          },
        },
      },
      Recommendation: {
        plans: {
          items($parent: Step<{ __conn: any }>) {
            return (get($parent, '__conn') as ConnectionStep<any, any, any>).nodes();
            // return constant([])
          },
          pageInfo($parent: Step<{ __conn: any }>) {
            return (get($parent, '__conn') as ConnectionStep<any, any, any>).pageInfo();
          },
        },
      },
    },
  };
});

function recommendationTypeNameFromType(type: unknown): string | null {
  return (
    {
      movie: 'MovieCollection',
      series: 'SeriesCollection',
    }[type as string] ?? null
  );
}