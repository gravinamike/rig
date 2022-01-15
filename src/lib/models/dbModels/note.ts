import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { Thing } from "$lib/models/dbModels"


/*
 * Note model.
 */
export class Note extends Model {
    kind = "note" as const
    static tableName = "notes" as const

    id!: number
    text!: string

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