import { TYPES } from 'postgraphile/@dataplan/pg';
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { shop, pet, get_shop_info },
      },
    },
    grafast: { each, constant, lambda, connection },
  } = build;

  return {
    typeDefs: gql`
      extend type Query {
        shopsByIds(ids: [Int!]!): [Shop]!
      }

      extend type Shop {
        info: ShopInfo
        pets: PetsConnection
      }

      type ShopInfo {
        petInfo(filter: String): JSON
        customersInfo(filter: String): JSON
      }

      extend type Pet {
        shop: Shop
      }
    `,
    plans: {
      Query: {
        shopsByIds(_, { $ids }) {
          return each($ids, ($id) => shop.find({ id: $id, visible: constant(true) }).single())
        }
      },
      Shop: {
        info($parent) {
          return $parent;
        },
        pets($parent) {
          return connection(pet.find({ shop_id: $parent.get('id') }))
        }
      },
      ShopInfo: {
        petInfo($parent, { $filter }) {
          const $fnData = get_shop_info.execute([{ step: $parent.get('id'), pgCodec: TYPES.int, name: 'id_param' }], 'normal')

          return lambda([$fnData, $filter], ([fnData, filter]) => {
            return { pet: fnData, filter }
          });
        },
        customersInfo($parent, { $filter }) {
          const $fnData = get_shop_info.execute([{ step: $parent.get('id'), pgCodec: TYPES.int, name: 'id_param' }], 'normal')

          return lambda([$fnData, $filter], ([fnData, filter]) => {
            return { customer: fnData, filter }
          });
        }
      },
      Pet: {
        shop($parent) {
          return shop.get({ id: $parent.get('shop_id') });
        }
      }
    },
  };
});

