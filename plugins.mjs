import { TYPES } from 'postgraphile/@dataplan/pg';
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

export const myExtensions = makeExtendSchemaPlugin((build) => {
  const {
    input: {
      pgRegistry: {
        pgResources: { shop, owner, v_metadata, image, get_shop_info },
      },
    },
    grafast: { each, constant, lambda, connection, object },
  } = build;

  return {
    typeDefs: gql`
      extend type Query {
        shopsByIds(ids: [String!]!): [Shop]!
      }

      extend type Shop {
        info: ShopInfo
        owner: Owner
        options: MetaOptions
        image: Image
      }

      type ShopInfo {
        petInfo(filter: String): JSON
        customersInfo(filter: String): JSON
      }

      type MetaOptions {
        pickup: Boolean!
        worldwide: Boolean!
        random: String
      }

      extend type ShopFrontImage {
        layouts: Image
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
        image($parent) {
          const $layouts = image.find({
            parent_id: $parent.get('id'),
            parent_type: 'shop',
            type: 'front',
          });
          return $layouts.single();
        },
        owner($parent) {
          return owner
            .find({
              id: $parent.get('owner_id'),
            })
            .single();
        },
        options($parent) {
          const special = v_metadata.find({
            id: $parent.get('dis_special'),
          });
          const specialTitle = special.single().get('title');
          return object({
            pickup: lambda($parent.get('di_pickup'), (v) => v !== null),
            worldwide: lambda($parent.get('di_worldwide'), (v) => v !== null),
            random: specialTitle,
          });
        }
      },
      ShopInfo: {
        petInfo($parent, { $filter }) {
          const $fnData = get_shop_info.execute([{ step: $parent.get('id'), pgCodec: TYPES.int, name: 'id_param' }], 'normal')

          return $fnData;
        },
        customersInfo($parent, { $filter }) {
          const $fnData = get_shop_info.execute([{ step: $parent.get('id'), pgCodec: TYPES.int, name: 'id_param' }], 'normal')

          return $fnData;
        }
      },
      ShopFrontImage: {
        layouts($parent) {
          const $layouts = image.find({
            parent_id: $parent.get('id'),
            parent_type: 'shop',
            type: 'front',
          });
          return $layouts.single();
        }
      },
    },
  };
});

