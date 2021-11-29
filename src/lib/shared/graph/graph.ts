import type { HalfAxisId } from "$lib/shared/constants"
import type { Thing } from "$lib/shared/graph/graphDbConstructs"
import { encapsulationChangeByHalfAxisId } from "$lib/shared/constants"
import { storeGraphConstructs, graphConstructInStore } from "$lib/shared/stores/graphStores"
import { ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/shared/graph/graphWidgets"


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
    encapsulatingDepth: number

    constructor(address: CohortAddress | null, members: GenerationMember[]) {
        this.address = address
        this.members = members
        for (const member of members) member.parentCohort = this
        const parentEncapsulatingDepth = this.address?.parentThingWidgetModel.parentCohort?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = encapsulationChangeByHalfAxisId[this.address?.halfAxisId || 0]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }
}


// Graph.
interface GraphStyle {
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
    style: GraphStyle = {
        offsetLength: 250,
        thingSize: 100,
        betweenThingGap: 20,
        relationshipTextSize: 18,
        thingTextSize: 12,
    }
    perspectiveHistory: { timestamp: Date, thingId: number }[] = []

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
            const storedThings = await storeGraphConstructs<Thing>("Thing", thingIdsToStore)
            const storedThingsById: { [thingId: number]: Thing } = {}
            storedThings.forEach(
                storedThing => storedThingsById[storedThing.id] = storedThing
            )

            //Add Thing Widgets (or Placeholders) based on those IDs to the current Graph generation.
            const membersForGeneration = thingIdsForGeneration.map(
                id => { return graphConstructInStore("Thing", id) ? new ThingWidgetModel(id) : new ThingPlaceholderWidgetModel(id) }
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

    addEntriesToHistory( thingIds: number | number[] ): void {
        if (typeof thingIds === "number") thingIds = [thingIds]
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this.perspectiveHistory.push(...entries)
    }
}