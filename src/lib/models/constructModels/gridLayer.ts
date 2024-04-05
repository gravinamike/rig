// Import types.
import type { Graph, GenerationMember, ThingCohort, Thing } from "$lib/models/constructModels"




/**
 * Grid Layer class.
 * 
 * Represents one of a Graph's Grid Layers, meaning the concentric squares of Things around the
 * Graph's center when it is built using the "grid" method.
 */
export class GridLayer {
    // String identifier for this type of Graph construct.
    kind = "gridLayer"

    // The Graph that the Grid Layer is part of.
    graph: Graph

    // The ID of the Grid Layer.
    id: number

    // The Grid Layer's Thing Cohorts.
    thingCohorts: ThingCohort[] = []

    // Which lifecycle stage the Grid Layer is currently in.
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"



    /**
     * Grid Layer constructor.
     * 
     * Creates a Grid Layer.
     * @param id - The ID of the Grid Layer.
     * @param graph - The Graph that the Grid Layer belongs to.
     */
    constructor(id: number, graph: Graph) {
        this.id = id
        this.graph = graph
    }



    /**
     * Generation-members getter.
     * 
     * Gets an array of the Generation members (Things wrapped with extra information) in the Grid
     * Layer, as an attribute.
     * @returns - An array of the Generation members in the Grid Layer.
     */
    get members(): GenerationMember[] {
        // Create an array of the Generation members in the Grid Layer, aggregated from the Grid
        // Layer's Thing Cohorts.
        const members: GenerationMember[] = []
        for (const thingCohort of this.thingCohorts) {
            members.push(...thingCohort.members)
        }

        // Return that array.
        return members
    }

    /**
     * Things method.
     * 
     * Gets an array of all the Things in this Grid Layer. Filters out any null "placeholder"
     * Things.
     * @returns - An array of all the Things in this Grid Layer.
     */
    things(): Thing[] {
        const things =
            this.members
                .filter(member => member.thing !== null)
                .map(member => member.thing) as Thing[]
        return things
    }    
}