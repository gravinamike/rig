import type { HalfAxisId, GraphWidgetStyle } from "$lib/shared/constants"
import type { Thing } from "$lib/shared/graph/graphDbConstructs"

import { defaultGraphWidgetStyle, offsetsByHalfAxisId } from "$lib/shared/constants"
import { storeGraphConstructs, graphConstructInStore } from "$lib/shared/stores/graphStores"
import { ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/shared/graph/graphWidgets"

export type GenerationMember = ThingWidgetModel | ThingPlaceholderWidgetModel


/** Class representing a Graph. */
export class Graph {
    _pThingIds: number[]
    _depth: number
    rootCohort: Cohort | null = null
    generations: Generation[] = []
    planes: { [planeId: number]: Plane } = {}
    planeOffsets = [0, 0]
    focalPlaneId = 0
    graphWidgetStyle: GraphWidgetStyle = defaultGraphWidgetStyle
    perspectiveHistory: { timestamp: Date, thingId: number }[] = []

    /**
     * Create a Graph.
     * @param {number[]} pThingIds - IDs for the Graph's starting Perspective Things.
     * @param {number}   depth     - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(pThingIds: number[], depth: number) {
        this._pThingIds = pThingIds
        this._depth = depth
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

    /**
     * Add a Generation to the Graph (containing supplied Generation Members).
     * @param {GenerationMember[]} members - Thing Widget Models (and/or Thing Widget Placeholder Models) that will constitute the Generation.
     */
    async addGeneration(): Promise<void> {
        const membersForGeneration = await this.thingIdsForGeneration(this.generationIdToBuild).map(
            id => { return graphConstructInStore("Thing", id) ? new ThingWidgetModel(id) : new ThingPlaceholderWidgetModel(id) }
        )

        this.generations.push(new Generation(this, membersForGeneration))
        //console.log(`Generation ${generationIdToBuild} added.`)
    }

    /**
     * Get one of the Graph's Generations by ID.
     * @param  {number} generationId - The ID of the Generation to retrieve.
     * @return {Generation | null}   - The specified Generation (or null if it doesn't exist).
     */
    generation( generationId: number ): Generation | null {
        const generation = 0 <= generationId && generationId < this.generations.length ? this.generations[generationId] : null
        return generation
    }

    /**
     * Add a Cohort to the Graph's Generations by ID.
     * @param {Cohort} cohort - The Cohort which will be added to the Generation.
     * @param {number} generationId - The ID of the Generation to which the Cohort will be added.
     */
    addCohortToGeneration( cohort: Cohort, generationId: number ): void {
        const generation = this.generation(generationId)
        if (!generation) {
            return
        } else {
            generation.cohorts.push(cohort)
        }
    }

    /**
     * Add a Cohort to the Graph's Planes by ID.
     * @param {Cohort} cohort - The Cohort which will be added to the Plane.
     * @param {number} planeId - The ID of the Plane to which the Cohort will be added.
     */
    addCohortToPlane( cohort: Cohort, planeId: number ): void {
        if (!(planeId in this.planes)) this.planes[planeId] = new Plane(planeId)
        this.planes[planeId].addCohort(cohort)
    }

    thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.generations.map(generation => generation.thingWidgetModels()).flat()
        return thingWidgetModels
    }





























    seedThingWidgetModels(): ThingWidgetModel[] {
        if (!this.generations.length) {
            return []
        } else {
            const seedGeneration = this.generations[this.generations.length - 1]
            const seedThingWidgetModels = seedGeneration.thingWidgetModels()
            return seedThingWidgetModels
        }
        // Note for the future: When adding Perspective depth deltas, filter the
        // seedThingWidgetModels list based on depth deltas.
    }



    thingIdsForGeneration(generationId: number): number[] {
        // For generation 0, start from the Perspective Thing IDs.
        // For generations >1, start from the IDs of the last generation's Relation Things.
        const thingIdsForGeneration = generationId === 0 ?
            this._pThingIds :
            this.seedThingWidgetModels().map(thingWidgetModel => thingWidgetModel.relatedThingIds).flat()
        //console.log(`Thing IDs for Generation ${generationIdToBuild}:`, thingIdsForGeneration)
        return thingIdsForGeneration
    }




    get generationIdToBuild(): number {
        for (const generation of this.generations.slice().reverse()) {
            if (["new", "building"].includes(generation.lifecycleStatus)) return this.generations.indexOf(generation)
        }
        return this.generations.length
    }

    get generationIdToStrip(): number {
        for (const generation of this.generations.slice().reverse()) {
            if (["built"].includes(generation.lifecycleStatus)) return this.generations.indexOf(generation)
        }
        return this.generations.length - 1
    }


    async storeNextGenerationThings(): Promise<void> {
        // Filter out Thing IDs already represented in the Graph (to avoid recursion).
        const thingIdsOfGraph = this.thingWidgetModels().map(thingWidgetModel => thingWidgetModel.thingId)
        const thingIdsToStore = this.thingIdsForGeneration(this.generationIdToBuild).filter( id => !thingIdsOfGraph.includes(id) )

        // Store Things from the IDs.
        const storedThings = await storeGraphConstructs<Thing>("Thing", thingIdsToStore)
        const storedThingsById: { [thingId: number]: Thing } = {}
        storedThings.forEach(
            storedThing => storedThingsById[storedThing.id] = storedThing
        )
    }


    /* A Generation is just a list of Things and Placeholders. But the
     * Things are related across Generations. After building each
     * Generation, the Things in that Generation are used to fill in
     * the child Cohorts of the Things in the previous generation.
     */
    async connectNextGenerationThings(): Promise<void> {
        const generation = this.generation(this.generationIdToBuild) as Generation

        // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
        // serve as the starting point of the Graph.
        if (this.generationIdToBuild === 0) {
            const addressForCohort = {
                graph: this,
                generationId: this.generationIdToBuild,
                parentThingWidgetModel: null,
                halfAxisId: null
            }
            this.rootCohort = new Cohort(addressForCohort, generation.members)
            this.addCohortToPlane(this.rootCohort, 0)

        // For all Generations after 0, hook up that Generation's members, packaged in
        // Cohorts, to the parent Thing Widget Models of the previous Generation.
        } else {

            // For each Thing (not Placeholder) in the previous Generation,
            for (const prevThingWidgetModel of generation.parentGeneration?.thingWidgetModels() || []) {
                
                // For the ID of each half-axis from that Thing,
                for (const halfAxisId of prevThingWidgetModel.relatedThingHalfAxisIds) {
                    // Get the address for that half axis' Cohort.
                    const addressForCohort = {
                        graph: this,
                        generationId: this.generationIdToBuild,
                        parentThingWidgetModel: prevThingWidgetModel,
                        halfAxisId: halfAxisId
                    }
                    // Get list of the Things in that half axis' Cohort.
                    const childCohortThingIds = prevThingWidgetModel.relatedThingIdsByHalfAxisId(halfAxisId)
                    // Add the members from this Generation matching those IDs as a new Cohort on that half-axis.
                    const membersForCohort = childCohortThingIds.map(id => generation.membersById[id])
                    const childCohort = new Cohort(addressForCohort, membersForCohort)
                    // Populate the Cohort for the previous Generation's Thing in that Direction from that list.
                    prevThingWidgetModel.childCohort(halfAxisId, childCohort)
                }
            }
        }
    }


    async buildGeneration(): Promise<void> {
        // Store Things for new Generation.
        await this.storeNextGenerationThings()

        // Add a new Generation to the Graph, containing the corresponding Thing Widget Models (or Placeholders).
        await this.addGeneration()

        // Wrap the Thing Widget Models (or Placeholders) in Cohorts of the previous Generation's Thing Widget Models.
        await this.connectNextGenerationThings();

        // Mark the Generation as built.
        (this.generation(this.generationIdToBuild) as Generation).lifecycleStatus = "built"
    }




    

    async stripGeneration(): Promise<void> {
        const generationToStrip = this.generation(this.generationIdToStrip)

        if (!generationToStrip) {
            return
        } else {
            // Mark the Generation as stripping.
            generationToStrip.lifecycleStatus = "stripping"

            // For each ThingWidgetModel of the parent Generation,
            for (const thingWidgetModel of generationToStrip.parentGeneration?.thingWidgetModels() || []) {
                // For each Cohort of that ThingWidgetModel's cohorts,
                for (const cohort of thingWidgetModel.childCohorts) {
                    // Clear the Cohort's members.
                    cohort.members = []
                    // Remove the Cohort from its Generation and its Plane.
                    cohort.removeFromGroups()
                }
                // Clear the ThingWidgetModel's cohorts attribute.
                thingWidgetModel.childCohortsByHalfAxisId = {}
            }
            // Remove the Generation from the graph.
            const index = this.generations.indexOf(generationToStrip)
            if (index > -1) this.generations.splice(index, 1)

            // Mark the Generation as stripped.
            generationToStrip.lifecycleStatus = "stripped"
        }     
    }




































    


    async build(): Promise<void> {
        this.rootCohort = null
        this.generations = []
        this.planes = {}

        for (let i = 0; i <= this._depth; i++) await this.buildGeneration()

        // Initialize the History based on the starting Perspective Thing IDs.
        this.addEntriesToHistory(this._pThingIds)
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


// Generation.
export class Generation {
    kind = "generation"

    graph: Graph
    id: number
    members: GenerationMember[]
    cohorts: Cohort[] = []
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"

    constructor(graph: Graph, members: GenerationMember[]) {
        this.graph = graph
        this.id = graph.generationIdToBuild
        this.members = members
    }

    get parentGeneration(): Generation | null {
        if (this.id === 0) {
            return null
        } else {
            return this.graph.generation(this.id - 1)
        }
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
    graph: Graph,
    generationId: number,
    parentThingWidgetModel: ThingWidgetModel | null,
    halfAxisId: HalfAxisId | null
}

export class Cohort {
    kind = "cohort"

    address: CohortAddress
    members: GenerationMember[]
    encapsulatingDepth: number
    plane: Plane | null = null

    constructor(address: CohortAddress, members: GenerationMember[]) {
        this.address = address
        this.members = members
        for (const member of members) member.parentCohort = this

        // Plane.
        let planeId: number
        if (!this.address) {
            planeId = 0
        } else {
            const parentPlaneId = this.parentCohort()?.plane?.id || 0
            const changeInPlane = offsetsByHalfAxisId[this.address?.halfAxisId || 0][2]
            planeId = parentPlaneId + changeInPlane
        }
        this.address.graph.addCohortToGeneration(this, this.address.generationId)
        this.address.graph.addCohortToPlane(this, planeId)

        // Encapsulation depth.
        const parentEncapsulatingDepth = this.parentCohort()?.encapsulatingDepth || 0
        const changeInEncapsulatingDepth = offsetsByHalfAxisId[this.address?.halfAxisId || 0][3]
        this.encapsulatingDepth = parentEncapsulatingDepth + changeInEncapsulatingDepth
    }

    parentCohort(): Cohort | null {
        return this.address.parentThingWidgetModel?.parentCohort || null
    }

    indexOfMember(member: GenerationMember): number | null {
        const index = this.members.indexOf(member)
        const output = index !== -1 ? index : null
        return output
    }

    removeFromGroups(): void {
        const generation = this.address.graph.generation(this.address.generationId)
        if (generation) {
            const index = generation.cohorts.indexOf(this)
            if (index > -1) generation.cohorts.splice(index, 1)
        }
        if (this.plane) {
            const index = this.plane.cohorts.indexOf(this)
            if (index > -1) this.plane.cohorts.splice(index, 1)
        }
    }

}

export class Plane {
    kind = "plane"

    id: number
    cohorts: Cohort[] = []

    constructor(id: number) {
        this.id = id
    }

    addCohort(cohort: Cohort): void {
        this.cohorts.push(cohort)
        cohort.plane = this
    }
}