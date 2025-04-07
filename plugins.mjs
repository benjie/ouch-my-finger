
import { sideEffect } from "postgraphile/grafast";
import { GraphQLError } from "postgraphile/graphql";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { animal, shop, owner },
      },
    },
    grafast: { connection },
  } = build;

  return {
    typeDefs: gql`
      extend type Shop {
        animals: AnimalsConnection
      }

      extend type CatAnimal {
        owners: OwnersConnection
      }
      extend type DogAnimal {
        owners: OwnersConnection
      }

      extend type Owner {
        hasClinic: Boolean
      }
    `,
    plans: {
      Shop: {
        animals($shop, { $first }) {
          sideEffect($first, (arg) => {
            if (arg && arg > 10) {
              throw new GraphQLError('wrong input')
            }
          })
          const $animals = animal.find({
            shop_id: $shop.get('id')
          })

          return connection($animals)
        },
      },
      CatAnimal: {
        owners($animal, { $first }) {
          sideEffect($first, (arg) => {
            if (arg && arg > 10) {
              throw new GraphQLError('wrong input')
            }
          })
          const $owners = owner.find({
            animal_id: $animal.get('id')
          })

          return connection($owners);
        }
      },
      DogAnimal: {
        owners($animal, { $first }) {
          sideEffect($first, (arg) => {
            if (arg && arg > 10) {
              throw new GraphQLError('wrong input')
            }
          })
          const $owners = owner.find({
            animal_id: $animal.get('id')
          })

          return connection($owners);
        }
      },
      Owner: {
        hasClinic($owner) {
          const $shop = shop.get({
            id: $owner.get('owner_id')
          })

          return $shop.get('has_clinic')
        }
      }
    },
  };
});

