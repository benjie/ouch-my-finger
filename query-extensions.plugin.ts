import { Step } from 'postgraphile/grafast';
import { extendSchema, gql } from 'postgraphile/utils';
import { conditionalReturn } from './conditional-return.ts';

export const queryExtensionsPlugin: GraphileConfig.Plugin =
    extendSchema((build) => {
        const {
            sql,
            input: { pgRegistry },
            grafast: { lambda, constant, condition, get, connection },
        } = build;
        const {
            video,
            collection,
        } = pgRegistry.pgResources;

        return {
            typeDefs: gql`
                input DocumentsByIdsAndTypesInput {
                    id: String!
                    type: String!
                }

                union Document = SeriesCollection | MovieCollection | Video
            
                extend type Query {
                    getDocuments(input: [DocumentsByIdsAndTypesInput!]!): [Document]!
                }

                extend type SeriesCollection {
                    episodes: VideosConnection
                }

                extend type MovieCollection {
                    video: Video
                }

                extend type Video {
                    collection: Collection
                }
            `,
            unions: {
                Document: {
                    planType($specifier: Step<{ id: string; type: string }>) {
                        // conditionalReturn is a custom step. If you have a better way (or built-in) to handle if, else cases, please suggest. Thanks!
                        const $type = conditionalReturn(
                            condition('===', get($specifier, 'type'), constant('COLLECTION')),
                            collection.get({ id: get($specifier, 'id') }).get('type'),
                            get($specifier, 'type'),
                        );
                        const $__typename = lambda($type, teaserTypeNameFromType, true);

                        return {
                            $__typename,
                            planForType(t) {
                                switch (t.name) {
                                    case 'MovieCollection':
                                    case 'SeriesCollection': {
                                        const $id = get($specifier, 'id');
                                        const $collection = collection.find({ id: $id });
                                        $collection.where(sql`${$collection.alias}.visible = true`);

                                        return $collection.single();
                                    }
                                    case 'Video': {
                                        const $id = get($specifier, 'id');
                                        return video.get({ id: $id, visible: constant(true) });
                                    }
                                    default: {
                                        console.warn(`Don't know how to fetch ${t.name}`);
                                        return null;
                                    }
                                }
                            },
                        };
                    },
                },
            },
            objects: {
                Query: {
                    plans: {
                        getDocuments($parent, { $input }) {
                            return $input;
                        },
                    },
                },
                SeriesCollection: {
                    plans: {
                        episodes($parent) {
                            const $videos = video.find({ parent_id: $parent.get('id') });
                            return connection($videos)
                        }
                    }
                },
                MovieCollection: {
                    plans: {
                        video($parent) {
                            const $videos = video.find({ parent_id: $parent.get('id') });
                            return $videos.single()
                        }
                    }
                },
                Video: {
                    plans: {
                        collection($parent) {
                            const $lambda = lambda($parent.get('parent_id'), (id) => console.log({ id }), true);
                            $lambda.hasSideEffects = true;
                            return collection.get({ id: $parent.get('parent_id') });
                        }
                    }
                }
            },
        };
    });

function teaserTypeNameFromType(type: unknown): string | null {
    return (
        {
            movie: 'MovieCollection',
            series: 'SeriesCollection',
            VIDEO: 'Video',
        }[type as string] ?? null
    );
}
