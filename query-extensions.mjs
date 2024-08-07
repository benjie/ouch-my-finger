import { TYPES, pgUnionAll } from "postgraphile/@dataplan/pg";
import { gql, makeExtendSchemaPlugin } from "postgraphile/utils";

/** @type {GraphileConfig.Plugin} */
export const rootQueryExtensionsPlugin = makeExtendSchemaPlugin((build) => {
  const {
    sql,
    input: { pgRegistry },
    grafast: { connection },
  } = build;
  const { cats, dogs } = pgRegistry.pgResources;
  return {
    typeDefs: gql`
      extend type Query {
        animals: AnimalsConnection
        animalById(id: UUID!): Animal
        cats: CatsConnection
        dogs: DogsConnection
      }
    `,
    plans: {
      Query: {
        animals() {
          const $animals = pgUnionAll({
            resourceByTypeName: {
              Cat: cats,
              Dog: dogs,
            },
            name: "Animal",
          });

          return connection($animals);
        },
        animalById(_, { $id }) {
          const $animals = pgUnionAll({
            resourceByTypeName: {
              Cat: cats,
              Dog: dogs,
            },
            name: "Animal",
          });
          $animals.where(
            sql`${$animals.alias}.id = ${$animals.placeholder($id, TYPES.uuid)}`
          );

          return $animals.single();
        },
        cats() {
          const $cats = cats.find();

          return connection($cats);
        },
        dogs() {
          const $dogs = cats.find();

          return connection($dogs);
        },
      },
    },
  };
});
