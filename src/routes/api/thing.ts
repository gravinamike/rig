import  Knex from 'knex'
import { Model, knexSnakeCaseMappers, RelationMappings, RelationMappingsThunk } from 'objection'


// Initialize Knex.
const knex = Knex({
  client: 'pg',
  version: '1.4',
  connection: {
    user: 'sa',
    host: 'localhost',
    database: 'C:/Users/mtgra/Desktop/LifeSeahorse_test/LifeGrid_graph/graph',
    password: 'goodguess',
    port: 5435,
  },
  ...knexSnakeCaseMappers({ upperCase: true })
});

// Pass Knex instance to Objection.
Model.knex(knex);


// Thing model.
export class Thing extends Model {
  id!: number
  text!: string
  note!: Note | null
  a_relations!: Thing[]
  b_relations!: Thing[]
  relationshipThingAId: number | null = null
  relationshipThingBId: number | null = null

  static tableName = 'things'

  static get relationMappings(): RelationMappings | RelationMappingsThunk {
    return {
      a_relationships: {
        relation: Model.HasManyRelation,
        modelClass: Relationship,
        join: {
          from: 'things.id',
          to: 'relationships.thingaid'
        }
      },
      b_relationships: {
        relation: Model.HasManyRelation,
        modelClass: Relationship,
        join: {
          from: 'things.id',
          to: 'relationships.thingbid'
        }
      },
      a_relations: {
        relation: Model.ManyToManyRelation,
        modelClass: Thing,
        join: {
          from: 'things.id',
          through: {
            from: 'relationships.thingbid',
            to: 'relationships.thingaid',
            modelClass: Relationship,
            extra: { relationship_thing_a_id: 'thingaid', relationship_thing_b_id: 'thingbid' }
          },
          to: 'things.id'
        }
      },
      b_relations: {
        relation: Model.ManyToManyRelation,
        modelClass: Thing,
        join: {
          from: 'things.id',
          through: {
            from: 'relationships.thingaid',
            to: 'relationships.thingbid',
            modelClass: Relationship,
            extra: { relationship_thing_a_id: 'thingaid', relationship_thing_b_id: 'thingbid' }
          },
          to: 'things.id'
        }
      },
      note: {
        relation: Model.HasOneThroughRelation,
        modelClass: Note,
        join: {
          from: 'things.id',
          through: {
            from: 'notetothing.thingid',
            to: 'notetothing.noteid'
          },
          to: 'notes.id'
        }
      }
    };
  }
}


// Relationship model.
class Relationship extends Model {
  static tableName = 'relationships'

  static get relationMappings(): RelationMappings | RelationMappingsThunk {
    return {
      things: {
        relation: Model.HasOneRelation,
        modelClass: Thing,
        join: {
          from: 'relationships.thingbid',//NOTE THIS IS ONLY HALF THE RELATIONSHIPS...
          to: 'things.id'
        }
      }
    };
  }
}


// Notes model.
class Note extends Model {
  text!: string

  static tableName = 'notes'

  static get relationMappings(): RelationMappings | RelationMappingsThunk {
    return {
      things: {
        relation: Model.HasOneThroughRelation,
        modelClass: Thing,
        join: {
          from: 'notes.id',
          through: {
            from: 'notetothing.noteid',
            to: 'notetothing.thingid'
          },
          to: 'things.id'
        }
      }
    };
  }
}


async function generateThings(): Promise< Thing[] > {
  const things = await Thing.query()
    .allowGraph('[a_relations, b_relations, note]')
    .withGraphFetched('[a_relations, b_relations, note]')
    .limit(3)
    .where("text", "Set of today's tasks")
    .orderBy('id')
    .debug()
    //.then(results => results.forEach( (r) => console.log(r) ));
  return things;
}


export async function get(): Promise<{ body: Thing[] }> {
  return {
    body: await generateThings()
  };
}