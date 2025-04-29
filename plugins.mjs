import { pgPolymorphic, withPgClient } from "postgraphile/@dataplan/pg";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { animal, tree },
      },
    },
    grafast: { access, each, object, constant, loadMany, context },
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
    `,
    plans: {
      Query: {
        earthList(_, { $input }) {
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

          return each($input, ($content) => {
            const $specifier = object({
              id: access($content, ["id"]),
              type: access($content, ["type"]),
            });
            return pgPolymorphic($content, $specifier, entityMap);
          });
        },
      },
    },
  };
});
