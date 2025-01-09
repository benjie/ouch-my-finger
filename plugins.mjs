import { pgPolymorphic, withPgClient } from "postgraphile/@dataplan/pg";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { cat, dog },
      },
    },
    grafast: { access, each, object, constant, loadMany, context },
  } = build;

  return {
    typeDefs: gql`
      input AnimalIdsAndTypesInput {
        id: String!
        type: String!
      }
      union Animal = Dog | Cat

      extend type Query {
        animals(input: [AnimalIdsAndTypesInput!]!): [Animal]!
      }

      extend type Cat {
        canSpeak: JSON
      }
    `,
    plans: {
      Query: {
        animals(_, fieldArgs) {
          const entityMap = {
            Cat: {
              match: (specifier) => specifier.type === "CAT",
              plan: ($specifier) => cat.get({ id: access($specifier, ["id"]) }),
            },
            Dog: {
              match: (specifier) => specifier.type === "DOG",
              plan: ($specifier) => dog.get({ id: access($specifier, ["id"]) }),
            },
          };

          return each(fieldArgs.get("input"), ($content) => {
            const $specifier = object({
              id: access($content, ["id"]),
              type: access($content, ["type"]),
            });
            return pgPolymorphic($content, $specifier, entityMap);
          });
        },
      },
      Cat: {
        canSpeak() {
        //   const $settings = withPgClient(
        //     cat.executor,
        //     constant(null),
        //     async (client) => {
        //       const { rows } = await client.query({
        //         text: /* SQL */ `
        //         SELECT id
        //         FROM public.cat
        //       `,
        //       });

        //       return rows;
        //     }
        //   );
          const $settings = loadMany(constant(null), context().get('pool'), batchGetDogs);

          return $settings;
        },
      },
    },
  };
});

async function batchGetDogs(data, { unary: dbClient }) {
  if (data.length === 0) {
    return [];
  }

  const result = await dbClient.query({
    text: /* SQL */ `
    SELECT id
    FROM public.dog
    `,
  });

  return data.map(() => result.rows);
}
