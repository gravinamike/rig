import { Model, RelationMappings, RelationMappingsThunk } from "objection"
import { Thing } from "$lib/models/dbModels"


/*
 * Folder model.
 */
export class Folder extends Model {
    kind = "folder" as const
    static tableName = "folders" as const

    id!: number
    whencreated!: Date | null
    path!: string

    static get relationMappings(): RelationMappings | RelationMappingsThunk {
        return {
            things: {
                relation: Model.HasOneThroughRelation,
                modelClass: Thing,
                join: {
                    from: 'folders.id',
                    through: {
                        from: 'foldertothing.folderid',
                        to: 'foldertothing.thingid'
                    },
                    to: 'things.id'
                }
            }
        };
    }
}