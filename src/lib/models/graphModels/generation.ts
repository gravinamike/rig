import type { Graph, CohortAddress } from "$lib/models/graphModels"

import { cartesianHalfAxisIds } from "$lib/shared/constants"
import { graphConstructInStore } from "$lib/stores"
import { Cohort } from "$lib/models/graphModels"
import { CohortWidgetModel } from "$lib/models/widgetModels/cohortWidgetModel"
import { RelationshipsWidgetModel } from "$lib/models/widgetModels/relationshipsWidgetModel"
import { ThingBaseWidgetModel, ThingWidgetModel, ThingMissingFromStoreWidgetModel } from "$lib/models/widgetModels"


export type GenerationMember = ThingBaseWidgetModel | ThingWidgetModel

export class Generation {
    kind = "generation"

    graph: Graph
    id: number
    _isRelationshipsOnly = false
    cohorts: Cohort[] = []
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"

    constructor(graph: Graph, generationIdToBuild: number) {
        this.graph = graph
        this.id = generationIdToBuild
    }

    get isRelationshipsOnly(): boolean {
        return this._isRelationshipsOnly
    }

    set isRelationshipsOnly(isRelationshipsOnly: boolean) {
        this._isRelationshipsOnly = isRelationshipsOnly
    }

    get parentGeneration(): Generation | null {
        if (this.id === 0) {
            return null
        } else {
            return this.graph.generations.byId(this.id - 1)
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

    



    async build(memberIdsForGeneration: number[]): Promise<void> {

        // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
        // serve as the starting point of the Graph.
        if (this.id === 0) {

            const addressForCohort: CohortAddress = {
                graph: this.graph,
                generationId: this.id,
                parentThingWidgetModel: null,
                directionId: null
            }
            this.graph.rootCohort = new Cohort(addressForCohort, [])
            for (const memberId of memberIdsForGeneration) {

                const member = this.graph.generations.thingIdsAlreadyInGraph.includes(memberId) ? new ThingBaseWidgetModel(memberId, this.graph) : // If the Thing is already modeled in the Graph, return a spacer model.
                graphConstructInStore("Thing", memberId) ? new ThingWidgetModel(memberId, this.graph) :      // Else, if the Thing is in the Thing store, create a new model for that Thing ID.
                new ThingMissingFromStoreWidgetModel(memberId, this.graph)     
                 
                this.graph.rootCohort.addMember(member)
            }

            this.graph.rootCohortWidgetModel = new CohortWidgetModel(this.graph.rootCohort, this.graph)
            this.graph.planes.addCohortToPlane(this.graph.rootCohort, 0)


        // For all Generations after 0, hook up that Generation's members, packaged in
        // Cohorts, to the parent Thing Widget Models of the previous Generation.
        } else {

            // For each Thing (not Placeholder) in the previous Generation,
            for (const prevThingWidgetModel of this.parentGeneration?.thingWidgetModels() || []) {
                
                const cartesianDirectionIds: number[] = []
                for (const cartesianHalfAxisId of cartesianHalfAxisIds) {
                    const cartesianDirectionId = prevThingWidgetModel.space.directionIdByHalfAxisId[cartesianHalfAxisId]
                    if (cartesianDirectionId) cartesianDirectionIds.push(cartesianDirectionId)
                }

                // For the ID of each half-axis from that Thing (plus any empty "Cartesian" half-axes - 1, 2, 3, 4),
                const directionIdsForCohorts = [...new Set([
                    ...prevThingWidgetModel.relatedThingDirectionIds,
                    ...cartesianDirectionIds])
                ]///////////////////////////////////////////////////// FIX THIS
                for (const directionId of directionIdsForCohorts) {
                    // Get the address for that half axis' Cohort.
                    const addressForCohort = {
                        graph: this.graph,
                        generationId: this.id,
                        parentThingWidgetModel: prevThingWidgetModel,
                        directionId: directionId
                    }

                    // Get list of the Things in that half axis' Cohort.
                    const childCohortThingIds = prevThingWidgetModel.relatedThingIdsByDirectionId[directionId] || []
                    // Add the members from this Generation matching those IDs as a new Cohort on that Half-Axis.
                    const membersIdForCohort = childCohortThingIds.length ?
                        memberIdsForGeneration.filter((memberId) => {if (childCohortThingIds.includes(memberId)) return true}) :
                        []
                    const childCohort = new Cohort(addressForCohort, [])
                    for (const memberId of membersIdForCohort) {

                        const member = this.graph.generations.thingIdsAlreadyInGraph.includes(memberId) ? new ThingBaseWidgetModel(memberId, this.graph) : // If the Thing is already modeled in the Graph, return a spacer model.
                        graphConstructInStore("Thing", memberId) ? new ThingWidgetModel(memberId, this.graph) :      // Else, if the Thing is in the Thing store, create a new model for that Thing ID.
                        new ThingMissingFromStoreWidgetModel(memberId, this.graph)     
                         
                        childCohort.addMember(member)
                    }

                    // Create a new Cohort Widget Model and and assign to the previous Generation's Thing in that Direction.
                    const childCohortWidgetModel = new CohortWidgetModel(childCohort, this.graph)
                    prevThingWidgetModel.childCohortWidgetModel(childCohortWidgetModel)

                    // Create a new Relationships Widget Model and assign to the previous Generation's Thing in that Direction.
                    const relationshipsWidgetModel = new RelationshipsWidgetModel(childCohort, prevThingWidgetModel.space, this.graph)
                    prevThingWidgetModel.relationshipsWidgetModel(relationshipsWidgetModel)
                }
            }
        }

        // Mark the Generation as built.
        this.lifecycleStatus = "built"

    }
    
}