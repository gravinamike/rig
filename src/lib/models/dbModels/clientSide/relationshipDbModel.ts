export interface RelationshipDbModel {
    id: string | number
    guid: string
    thingaid: number | null
    thingbid: number | null
    whencreated: string | null
    whenmodded: string | null
    direction: number// Default is 1
    relationshiporder: number | null
}