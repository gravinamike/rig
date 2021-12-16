import type { GraphWidgetStyle } from "$lib/shared/constants"
import type { Thing } from "$lib/shared/graph/dbConstructs"

import { defaultGraphWidgetStyle } from "$lib/shared/constants"
import { storeGraphConstructs, graphConstructInStore } from "$lib/shared/stores/graphStores"
import { Generation } from "$lib/shared/graph/generation"
import { Cohort } from "$lib/shared/graph/cohort"
import { Plane } from "$lib/shared/graph/plane"
import { ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/shared/graph/graphWidgets"


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
    allowZoomAndScrollToFit = false

    /**
     * Create a Graph.
     * @param {number[]} pThingIds - IDs for the Graph's starting Perspective Things.
     * @param {number}   depth     - How many Relationship "steps" to grow the Graph from the Perspective Things.
     */
    constructor(pThingIds: number[], depth: number) {
        this._pThingIds = pThingIds
        this._depth = depth
    }


    /* Basic informational methods. */

    get pThingIds(): number[] {
        return this._pThingIds
    }

    get depth(): number | null {
        return this._depth
    }

    /**
     * Get one of the Graph's Generations by ID.
     * @param  {number} generationId - The ID of the Generation to retrieve.
     * @return {Generation | null}   - The specified Generation (or null if it doesn't exist).
     */
    generationById( generationId: number ): Generation | null {
        const generation = 0 <= generationId && generationId < this.generations.length ? this.generations[generationId] : null
        return generation
    }

    get thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.generations.map(generation => generation.thingWidgetModels()).flat()
        return thingWidgetModels
    }


    /* Basic setter methods. */

    async setPThingIds(pThingIds: number[]): Promise<void> {
        this._pThingIds = pThingIds
        await this.build()
    }

    async setDepth(depth: number): Promise<void> {
        this._depth = depth
        await this.adjustGenerationsToDepth()
    }



    /* Informational methods for building and stripping. */

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






    
    /* Methods for building/stripping. */

    async build(): Promise<void> {
        this.rootCohort = null
        this.generations = []
        this.planes = {}
        this.focalPlaneId = 0

        // for (let i = 0; i <= this._depth; i++) await this.buildGeneration()
        await this.adjustGenerationsToDepth()

        // Initialize the History based on the starting Perspective Thing IDs.
        this.addEntriesToHistory(this._pThingIds)
    }

    async adjustGenerationsToDepth(): Promise<void> {
        let difference = this.generations.length - (this._depth + 1)
        while (difference) {
            if (difference < 0) {
                await this.buildGeneration()
            } else {
                await this.stripGeneration()
            }
            difference = this.generations.length - (this._depth + 1)
        }
    }

    /**
     * Build a new Generation onto the Graph.
     */
     async buildGeneration(): Promise<void> {
        // Store Things for new Generation.
        await this.storeNextGenerationThings()

        const membersForGeneration = this.thingIdsForGeneration(this.generationIdToBuild).map(
            id => { return graphConstructInStore("Thing", id) ? new ThingWidgetModel(id) : new ThingPlaceholderWidgetModel(id) }
        )

        // Add the new, empty Generation.
        const newGeneration = new Generation(this)
        this.generations.push(newGeneration)

        // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
        // serve as the starting point of the Graph.
        if (this.generationIdToBuild === 0) {
            const addressForCohort = {
                graph: this,
                generationId: this.generationIdToBuild,
                parentThingWidgetModel: null,
                halfAxisId: null
            }
            this.rootCohort = new Cohort(addressForCohort, membersForGeneration)
            this.addCohortToPlane(this.rootCohort, 0)

        // For all Generations after 0, hook up that Generation's members, packaged in
        // Cohorts, to the parent Thing Widget Models of the previous Generation.
        } else {

            // For each Thing (not Placeholder) in the previous Generation,
            for (const prevThingWidgetModel of newGeneration.parentGeneration?.thingWidgetModels() || []) {
                
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
                    const membersForCohort = membersForGeneration.filter((member) => {if (childCohortThingIds.includes(member.thingId)) return true})
                    const childCohort = new Cohort(addressForCohort, membersForCohort)
                    // Populate the Cohort for the previous Generation's Thing in that Direction from that list.
                    prevThingWidgetModel.childCohort(halfAxisId, childCohort)
                }
            }
        }

        // Mark the Generation as built.
        newGeneration.lifecycleStatus = "built"
    }


    async storeNextGenerationThings(): Promise<void> {
        // Filter out Thing IDs already represented in the Graph (to avoid recursion).
        const thingIdsOfGraph = this.thingWidgetModels.map(thingWidgetModel => thingWidgetModel.thingId)
        const thingIdsToStore = this.thingIdsForGeneration(this.generationIdToBuild).filter( id => !thingIdsOfGraph.includes(id) )

        // Store Things from the IDs.
        const storedThings = await storeGraphConstructs<Thing>("Thing", thingIdsToStore)
        const storedThingsById: { [thingId: number]: Thing } = {}
        storedThings.forEach(
            storedThing => storedThingsById[storedThing.id] = storedThing
        )
    }

    /**
     * Add a Cohort to the Graph's Planes by ID (creating the Plane if necessary).
     * @param {Cohort} cohort - The Cohort which will be added to the Plane.
     * @param {number} planeId - The ID of the Plane to which the Cohort will be added.
     */
    addCohortToPlane( cohort: Cohort, planeId: number ): void {
        if (!(planeId in this.planes)) this.planes[planeId] = new Plane(planeId, this)
        this.planes[planeId].addCohort(cohort)
    }

    addEntriesToHistory( thingIds: number | number[] ): void {
        if (typeof thingIds === "number") thingIds = [thingIds]
        const timestamp = new Date()
        const entries = thingIds.map(
            (thingId) => { return { timestamp: timestamp, thingId: thingId } }
        )
        this.perspectiveHistory.push(...entries)
    }

    async stripGeneration(): Promise<void> {
        const generationToStrip = this.generationById(this.generationIdToStrip)

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
}