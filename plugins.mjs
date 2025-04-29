import { pgPolymorphic, withPgClient } from "postgraphile/@dataplan/pg";
import { connection, lambda } from "postgraphile/grafast";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { animal, tree, food },
      },
    },
    grafast: { access, each, object },
  } = build;

  return {
    typeDefs: gql`
      input IdsAndTypesInput {
        id: Int!
        type: String!
      }

      union Earth = CatAnimal | DogAnimal | WolfAnimal | Tree

      extend type Query {
        earthList(input: [IdsAndTypesInput!]!): [Earth]!
      }

      extend type CatAnimal {
        food(sortBy: String): FoodsConnection
      }
      extend type DogAnimal {
        food(sortBy: String): FoodsConnection
      }
    `,
    plans: {
      Query: {
        earthList(_, { $input }) {
          const $contents = resolveInputTypes(animal.executor, $input);
          const entityMap = {
            CatAnimal: {
              match: (specifier) => specifier.type === "cat",
              plan: ($specifier) => animal.get({ id: access($specifier, ["id"]) }),
            },
            DogAnimal: {
              match: (specifier) => specifier.type === "dog",
              plan: ($specifier) => animal.get({ id: access($specifier, ["id"]) }),
            },
            WolfAnimal: {
              match: (specifier) => specifier.type === "wolf",
              plan: ($specifier) => animal.get({ id: access($specifier, ["id"]) }),
            },
            Tree: {
              match: (specifier) => specifier.type === "tree",
              plan: ($specifier) => tree.get({ id: access($specifier, ["id"]) }),
            },
          };

          return each($contents, ($content) => {
            const $specifier = object({
              id: access($content, ["id"]),
              type: access($content, ["type"]),
            });
            return pgPolymorphic($content, $specifier, entityMap);
          });
        },
      },
      CatAnimal: {
        food($animal, { $sortBy }) {
          const $foods = food.find({ animal_id: $animal.get('id') });

          $foods.apply(lambda($sortBy, (sortBy) => (qb) => {
            if (sortBy) {
              qb.orderBy({ attribute: sortBy, direction: 'ASC' })
            }
          }));

          return connection($foods);
        }
      },
      DogAnimal: {
        food($animal, { $sortBy }) {
          const $foods = food.find({ animal_id: $animal.get('id') });
          
          $foods.apply(lambda($sortBy, (sortBy) => (qb) => {
            if (sortBy) {
              qb.orderBy({ attribute: sortBy, direction: 'ASC' })
            }
          }));

          return connection($foods);
        }
      }
    },
  };
});

function resolveInputTypes(executor, $input) {
  return withPgClient(executor, $input, async (pgClient, input) => {
    const result = await pgClient.query({
      text: /* SQL */ `
        WITH input_list AS (
          SELECT
            row_number() OVER () AS ord,
            item->>'id' AS id,
            item->>'type' AS type
          FROM json_array_elements($1::json) AS item
        )
        SELECT
          il.id,
          CASE
            WHEN il.type = 'animal' THEN COALESCE(a.type, 'dog')
            ELSE il.type
          END AS type
        FROM input_list il
        LEFT JOIN animal a
          ON a.id = il.id::int AND il.type = 'animal'
        ORDER BY il.ord
      `,
      values: [JSON.stringify(input)],
    });

    return result.rows;
  });
}