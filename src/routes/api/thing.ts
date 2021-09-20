import  Knex from 'knex'
import { Model, knexSnakeCaseMappers } from 'objection'


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
class Thing extends Model {
  static tableName = 'things'

  static get relationMappings() {
    return {
      relationships: {
        relation: Model.HasManyRelation,
        modelClass: Relationship,
        join: {
          from: 'things.id',
          to: 'relationships.thingbid'//NOTE THIS IS ONLY HALF THE RELATIONSHIPS...
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


class Relationship extends Model {
  static tableName = 'relationships'

  static get relationMappings() {
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


class Note extends Model {
  static tableName = 'notes'

  static get relationMappings() {
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
    .allowGraph('[relationships, note]')
    .withGraphFetched('[relationships, note]')
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