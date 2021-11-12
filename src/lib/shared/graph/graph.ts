import type { Space, Thing, Note } from "$lib/shared/graph/graphDb"
import { retrieveSpaces, spaceInStore, storeThings, retrieveThings, thingInStore } from "$lib/shared/stores"

export type HalfAxisId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export const halfAxisIds = [1, 2, 3, 4, 5, 6, 7, 8] as const
export const oddHalfAxisIds = [1, 3, 5, 7] as const


/*
 * Thing Widget Model.
 * Specifies info to build the widget representing a Thing within a specific Graph Portal.
 */
type ThingAddress = {
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel,
    halfAxisId: number,
    indexInCohort: number
}

export class ThingWidgetModel {
    kind = "thingWidgetModel"

    thingId: number
    thing: Thing | null
    parentCohort: Cohort | null = null
    childCohortsByHalfAxisId: { [directionId: number]: Cohort } = {}
    inheritSpace = true // For now.

    constructor(thingId: number) {
        this.thingId = thingId
        this.thing = retrieveThings(thingId)
    }

    // The following getter functions pass along the corresponding attributes from the encapsulated Thing.
    get text(): string {
        const text = this.thing ? this.thing.text : ""
        return text
    }

    get note(): Note | null {
        const note = this.thing ? this.thing.note : null
        return note
    }
    
    get defaultSpaceId(): number | null {
        const defaultSpaceId = this.thing ? this.thing.defaultplane : null
        return defaultSpaceId
    }

    get relatedThingIds(): number[] {
        const relatedThingIds = this.thing ? this.thing.relatedThingIds : []
        return relatedThingIds
    }

    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        const relatedThingIdsByDirectionId = this.thing ? this.thing.relatedThingIdsByDirectionId : {}
        return relatedThingIdsByDirectionId
    }

    get relatedThingDirectionIds(): number[] {
        const relatedThingDirectionIds = Object.keys(this.relatedThingIdsByDirectionId).map(k => Number(k))
        return relatedThingDirectionIds
    }

    // The following getter functions pass along the corresponding attributes from the Thing Widget's Cohort.
    get parentThingWidgetModel(): ThingWidgetModel | null {
        const parentThingWidgetModel = this.parentCohort && this.parentCohort.address ?
            this.parentCohort.address.parentThingWidgetModel :
            null
        return parentThingWidgetModel
    }

    // The following getter functions are derived from the pass-along getter functions above.
    get address(): ThingAddress | null {
        const address = this.parentCohort && this.parentCohort.address ? {
            generationId: this.parentCohort.address.generationId,
            parentThingWidgetModel: this.parentCohort.address.parentThingWidgetModel,
            halfAxisId: this.parentCohort.address.halfAxisId,
            indexInCohort: this.parentCohort.indexOfMember(this) as number
        } : null
        return address
    }

    get space(): Space {
        let space: Space
        // If not inheriting Space from parent, and the Thing Widget Model's own default Space
        // is available, use the Thing Widget Model's own default Space.
        if (
            !( this.parentThingWidgetModel && this.inheritSpace )
            && this.defaultSpaceId && spaceInStore(this.defaultSpaceId)
        ) {
            space = retrieveSpaces(this.defaultSpaceId) as Space
        // Else, if the Thing Widget model has a parent, use the parent's Space.
        } else if (this.parentThingWidgetModel) {
            space = this.parentThingWidgetModel.space
        // Else use the first Space in the list of Spaces.
        } else {
            space = retrieveSpaces(1) as Space//What if there is no spacesStoreValue[1]? Supply an empty Space.
        }
        return space
    }

    get relatedThingHalfAxisIds(): Set<HalfAxisId> {
        const relatedThingHalfAxisIds: Set<HalfAxisId> = new Set()
        for (const directionID of this.relatedThingDirectionIds) {
            const halfAxisId = this.space.halfAxisIdByDirectionId[directionID]
            if (halfAxisId) relatedThingHalfAxisIds.add(halfAxisId)
        }
        return relatedThingHalfAxisIds
    }
    
    get directionIdByHalfAxisId(): { [halfAxisId: number]: number | null } {
        const directionIdByHalfAxisId: { [halfAxisId: number]: number | null } = {};
        for (const oddHalfAxisId of oddHalfAxisIds) {
            const direction = this.space.directions[(oddHalfAxisId - 1)/2];
            directionIdByHalfAxisId[oddHalfAxisId] = direction.id;
            directionIdByHalfAxisId[oddHalfAxisId + 1] = direction.oppositeid;
        }
        return directionIdByHalfAxisId
    }

    get childCohorts(): Cohort[] {
        const childCohorts = Object.values(this.childCohortsByHalfAxisId)
        return childCohorts
    }

    relatedThingIdsByHalfAxisId(halfAxisId: HalfAxisId): number[] {
        const directionId = this.space.directionIdByHalfAxisId[halfAxisId]
        const relatedThingIds = directionId ? this.relatedThingIdsByDirectionId[directionId] : [] as number[]
        return relatedThingIds
    }

    childCohort( halfAxisId: number ): Cohort | null
    childCohort( halfAxisId: number, cohort: Cohort ): void
    childCohort( halfAxisId: number, cohort?: Cohort ): Cohort | null | void {
        if ( cohort === undefined ) {
            return halfAxisId in this.childCohortsByHalfAxisId ? this.childCohortsByHalfAxisId[halfAxisId] : null
        } else {
            // Set child Cohort for this Direction.
            this.childCohortsByHalfAxisId[halfAxisId] = cohort
        }
    }
}


export class ThingPlaceholderWidgetModel {
    kind = "thingPlaceholderWidgetModel"

    thingId: number
    thing: Thing | null
    parentCohort: Cohort | null = null

    constructor(thingId: number) {
        this.thingId = thingId
        this.thing = retrieveThings(thingId)
    }
}


export type GenerationMember = ThingWidgetModel | ThingPlaceholderWidgetModel


// Generation.
export class Generation {
    kind = "generation"

    members: GenerationMember[]

    constructor(members: GenerationMember[]) {
        this.members = members
    }

    get membersById(): { [memberId: number]: GenerationMember } {
        const membersById: { [memberId: number]: GenerationMember } = {}
        for (const member of this.members) membersById[member.thingId] = member
        return membersById
    }

    thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.members.filter(member => member.kind === "thingWidgetModel") as ThingWidgetModel[]
        return thingWidgetModels
    }
}


// Cohort.
type CohortAddress = {
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel,
    halfAxisId: HalfAxisId
}

export class Cohort {
    kind = "cohort"

    address: CohortAddress | null
    members: GenerationMember[]

    constructor(address: CohortAddress | null, members: GenerationMember[]) {
        this.address = address
        this.members = members

        for (const member of members) member.parentCohort = this
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }
}


// Graph.
interface GraphFormat {
    offsetLength: number,
    thingSize: number,
    betweenThingGap: number,
    relationshipTextSize: number,
    thingTextSize: number,
}

export class Graph {
    _pThingIds: number[]
    _depth: number
    rootCohort: Cohort | null = null
    generations: Generation[] = []
    format: GraphFormat = {
        offsetLength: 150,//250,
        thingSize: 80,
        betweenThingGap: 20,
        relationshipTextSize: 18,
        thingTextSize: 11,
    }

    constructor(pThingIds: number[], depth: number) {
        this._pThingIds = pThingIds
        this._depth = depth
    }

    addGeneration( members: GenerationMember[] ): void {
        this.generations.push(new Generation(members))
    }

    generation( generationId: number ): Generation | null {
        const generation = 0 <= generationId && generationId < this.generations.length ? this.generations[generationId] : null
        return generation
    }

    thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.generations.map(generation => generation.thingWidgetModels()).flat()
        return thingWidgetModels
    }

    async pThingIds(): Promise<number[]>
    async pThingIds( pThingIds: number[] ): Promise<void>
    async pThingIds( pThingIds?: number[] ): Promise<number[] | void> {
        if ( pThingIds === undefined ) {
            return this._pThingIds
        } else {
            this._pThingIds = pThingIds
            await this.build()
        }
    }

    async depth(): Promise<number | null>
    async depth( depth: number ): Promise<void>
    async depth( depth?: number ): Promise<number | null | void> {
        if ( depth === undefined ) {
            return this._depth
        } else {
            this._depth = depth
            await this.build()
        }
    }

    async build(): Promise<void> {
        this.rootCohort = null
        this.generations = []

        for (let i = 0; i <= this._depth; i++) {
            // For generation 0, start from the Perspective Thing IDs.
            // For generations >1, start from the IDs of the last generation's Relation Things.
            const thingIdsForGeneration = i === 0 ?
                this._pThingIds :
                (this.generation(i-1) as Generation).thingWidgetModels().
                    map(thingWidgetModel => thingWidgetModel.relatedThingIds).flat()
            //console.log(`Thing IDs for Generation ${i}:`, thingIdsForGeneration)

            // Filter out Thing IDs already represented in the Graph (to avoid recursion).
            const thingIdsOfGraph = this.thingWidgetModels().map(thingWidgetModel => thingWidgetModel.thingId)
            const thingIdsToStore = thingIdsForGeneration.filter( id => !thingIdsOfGraph.includes(id) )
            //console.log(`Thing IDs to store:`, thingIdsToStore)

            // Store Things from the IDs.
            const storedThings = await storeThings(thingIdsToStore)
            const storedThingsById: { [thingId: number]: Thing } = {}
            storedThings.forEach(
                storedThing => storedThingsById[storedThing.id] = storedThing
            )

            //Add Thing Widgets (or Placeholders) based on those IDs to the current Graph generation.
            const membersForGeneration = thingIdsForGeneration.map(
                id => { return thingInStore(id) ? new ThingWidgetModel(id) : new ThingPlaceholderWidgetModel(id) }
            )
            this.addGeneration(membersForGeneration)
            //console.log(`Generation ${i} added.`)

            /* A Generation is just a list of Things and Placeholders. But the
             * Things are related across Generations. After building each
             * Generation, the Things in that Generation are used to fill in
             * the child Cohorts of the Things in the previous generation.
             */
            // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
            // serve as the starting point of the Graph.
            if (i === 0) {
                const membersForCohort = (this.generation(i) as Generation).members
                this.rootCohort = new Cohort(null, membersForCohort)
            // Starting at Generation 1, hook up each Generation's Things, packaged in
            // Cohorts, to the parent Things of the previous Generation.
            } else {
                const prevGeneration = this.generation(i-1) as Generation
                const thisGeneration = this.generation(i) as Generation
                // For each Thing (not Placeholder) in the previous Generation,
                for (const prevThingWidgetModel of prevGeneration.thingWidgetModels()) {
                    //console.log('PREVIOUS THING WIDGET MODEL:', prevThingWidgetModel.thingId)
                    // For the ID of each half-axis from that Thing,
                    if (
                        prevThingWidgetModel.thing
                    ) for (const halfAxisId of prevThingWidgetModel.relatedThingHalfAxisIds) {
                        // Get the address for that half axis' Cohort.
                        const addressForCohort = {
                            generationId: i,
                            parentThingWidgetModel: prevThingWidgetModel,
                            halfAxisId: halfAxisId
                        }
                        // Get list of the Things in that half axis' Cohort.
                        const childCohortThingIds = Array.from(prevThingWidgetModel.relatedThingIdsByHalfAxisId(halfAxisId))
                        //console.log(childCohortThingIds)
                        // Add the members from this Generation matching those IDs as a new Cohort on that half-axis.
                        const membersForCohort = childCohortThingIds.map(id => thisGeneration.membersById[id])
                        const childCohort = new Cohort(addressForCohort, membersForCohort)
                        // Populate the Cohort for the previous Generation's Thing in that Direction from that list.
                        prevThingWidgetModel.childCohort(halfAxisId, childCohort)
                        //console.log('For Thing', prevThingWidgetModel.thing.id, ', Half-Axis', halfAxisId, ', Cohort', childCohortThingIds)
                    }
                }
            }
        }
    }
}