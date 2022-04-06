import type { Graph, CohortAddress } from "$lib/models/graphModels"
import type { ThingBaseWidgetModel, ThingWidgetModel } from "$lib/models/widgetModels"

import { cartesianHalfAxisIds } from "$lib/shared/constants"
import { Cohort } from "$lib/models/graphModels"
import { CohortWidgetModel } from "$lib/models/widgetModels/cohortWidgetModel"
import { RelationshipsWidgetModel } from "$lib/models/widgetModels/relationshipsWidgetModel"


export type GenerationMember = ThingBaseWidgetModel | ThingWidgetModel

export class Generation {
    kind = "generation"

    graph: Graph
    id: number
    cohorts: Cohort[] = []
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"

    constructor(graph: Graph, generationIdToBuild: number) {
        this.graph = graph
        this.id = generationIdToBuild
    }

    get parentGeneration(): Generation | null {
        if (this.id === 0) {
            return null
        } else {
            return this.graph.generationById(this.id - 1)
        }
    }

    get members(): GenerationMember[] {
        const members: GenerationMember[] = []
        for (const cohort of this.cohorts) {
            members.push(...cohort.members)
        }
        return members
    }

    get membersById(): { [memberId: number]: GenerationMember } {
        const membersById: { [memberId: number]: GenerationMember } = {}
        for (const member of this.members) if (member.thingId) membersById[member.thingId] = member
        return membersById
    }

    thingWidgetModels(): ThingWidgetModel[] {
        const thingWidgetModels = this.members.filter(member => member.kind === "thingWidgetModel") as ThingWidgetModel[]
        return thingWidgetModels
    }

    



    async build(membersForGeneration: GenerationMember[]): Promise<void> {

        // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
        // serve as the starting point of the Graph.
        if (this.id === 0) {
            const addressForCohort: CohortAddress = {
                graph: this.graph,
                generationId: this.id,
                parentThingWidgetModel: null,
                halfAxisId: 0
            }
            this.graph.rootCohort = new Cohort(addressForCohort, membersForGeneration)
            this.graph.rootCohortWidgetModel = new CohortWidgetModel(this.graph.rootCohort, this.graph)
            this.graph.addCohortToPlane(this.graph.rootCohort, 0)


        // For all Generations after 0, hook up that Generation's members, packaged in
        // Cohorts, to the parent Thing Widget Models of the previous Generation.
        } else {

            // For each Thing (not Placeholder) in the previous Generation,
            for (const prevThingWidgetModel of this.parentGeneration?.thingWidgetModels() || []) {
                
                // For the ID of each half-axis from that Thing (plus any empty "Cartesian" half-axes - 1, 2, 3, 4),
                const halfAxisIdsForCohorts = [...new Set([
                    ...prevThingWidgetModel.relatedThingHalfAxisIds,
                    ...cartesianHalfAxisIds])
                ]
                for (const halfAxisId of halfAxisIdsForCohorts) {
                    // Get the address for that half axis' Cohort.
                    const addressForCohort = {
                        graph: this.graph,
                        generationId: this.id,
                        parentThingWidgetModel: prevThingWidgetModel,
                        halfAxisId: halfAxisId
                    }

                    // Get list of the Things in that half axis' Cohort.
                    const childCohortThingIds = prevThingWidgetModel.relatedThingIdsByHalfAxisId(halfAxisId)
                    // Add the members from this Generation matching those IDs as a new Cohort on that Half-Axis.
                    const membersForCohort = childCohortThingIds.length ?
                        membersForGeneration.filter((member) => {if (member.thingId && childCohortThingIds.includes(member.thingId)) return true}) :
                        []
                    const childCohort = new Cohort(addressForCohort, membersForCohort)

                    // Populate the Cohort for the previous Generation's Thing in that Direction from that list.
                    prevThingWidgetModel.childCohort(halfAxisId, childCohort)////////////////////////// NOW REMOVE THIS!!!!

                    const childCohortWidgetModel = new CohortWidgetModel(childCohort, this.graph)
                    prevThingWidgetModel.childCohortWidgetModel(halfAxisId, childCohortWidgetModel)




                    // Create a new Relationships Widget Model.
                    const relationshipsWidgetModel = new RelationshipsWidgetModel(childCohort, prevThingWidgetModel.space, this.graph)

                    // Set that as the Relationships Widget Model for the previous Generation's Thing in that Direction.
                    prevThingWidgetModel.relationshipsWidgetModel(halfAxisId, relationshipsWidgetModel)


                }
            }
        }

        // Mark the Generation as built.
        this.lifecycleStatus = "built"

    }
    
}