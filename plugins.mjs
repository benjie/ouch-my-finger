import { pgPolymorphic, withPgClient } from "postgraphile/@dataplan/pg";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { animal, shop, owner },
      },
    },
    grafast: { access, each, object, constant, loadMany, context, connection },
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
        animals($shop) {
          const $animals = animal.find({
            shop_id: $shop.get('id')
          })

          return connection($animals)
        },
      },
      CatAnimal: {
        owners($animal) {
          const $food = owner.find({
            animal_id: $animal.get('id')
          })

          return connection($food)
        }
      },
      DogAnimal: {
        owners($animal) {
          const $food = owner.find({
            animal_id: $animal.get('id')
          })

          return connection($food)
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
