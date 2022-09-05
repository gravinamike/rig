import type { Graph, CohortAddress, Space } from "$lib/models/graphModels"
import { cartesianHalfAxisIds } from "$lib/shared/constants"
import { graphConstructInStore, retrieveGraphConstructs } from "$lib/stores"
import { Thing, ThingCohort } from "$lib/models/graphModels"


export type GenerationMember = Thing | number

export class Generation {
    kind = "generation"

    graph: Graph
    id: number
    _isRelationshipsOnly = false
    cohorts: ThingCohort[] = []
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
        for (const member of this.members) if (typeof member === "object") membersById[member.id] = member
        return membersById
    }

    things(): Thing[] {
        const things = this.members.filter(member => member !== null) as Thing[]
        return things
    }

    



    async build(memberIdsForGeneration: number[]): Promise<void> {
        // For Generation 0, add the Things to a pre-Graph "root" Cohort that will
        // serve as the starting point of the Graph.
        if (this.id === 0) {

            const addressForCohort: CohortAddress = {
                graph: this.graph,
                generationId: this.id,
                parentThingId: null,
                directionId: null
            }
            this.graph.rootCohort = new ThingCohort(addressForCohort, [])
            for (const memberId of memberIdsForGeneration) {


                const member = graphConstructInStore("Thing", memberId) ?
                    retrieveGraphConstructs<Thing>("Thing", memberId) as Thing :
                    memberId  
                
                this.graph.rootCohort.addMember(member)
            }

            this.graph.planes.addCohortToPlane(this.graph.rootCohort, 0)


        // For all Generations after 0, hook up that Generation's members, packaged in
        // Cohorts, to the parent Things of the previous Generation.
        } else {
            // For each Thing (not Placeholder) in the previous Generation,
            for (const prevThing of this.parentGeneration?.things() || []) {
                
                const cartesianDirectionIds: number[] = []
                for (const cartesianHalfAxisId of cartesianHalfAxisIds) {
                    const cartesianDirectionId = (prevThing.space as Space).directionIdByHalfAxisId[cartesianHalfAxisId]
                    if (cartesianDirectionId) cartesianDirectionIds.push(cartesianDirectionId)
                }

                // For the ID of each half-axis from that Thing (plus any empty "Cartesian" half-axes - 1, 2, 3, 4),
                const directionIdsForCohorts = [...new Set([
                    ...prevThing.relatedThingDirectionIds,
                    ...cartesianDirectionIds])
                ]///////////////////////////////////////////////////// FIX THIS
                for (const directionId of directionIdsForCohorts) {

                    // Get the address for that half axis' Cohort.
                    const addressForCohort = {
                        graph: this.graph,
                        generationId: this.id,
                        parentThingId: prevThing.id,
                        directionId: directionId
                    }

                    // Get list of the Things in that half axis' Cohort.
                    const childCohortThingIds = prevThing.relatedThingIdsByDirectionId[directionId] || []
                    // Add the members from this Generation matching those IDs as a new Cohort on that Half-Axis.
                    const membersIdForCohort = childCohortThingIds.length ?
                        memberIdsForGeneration.filter((memberId) => {if (childCohortThingIds.includes(memberId)) return true}) :
                        []
                    const childCohort = new ThingCohort(addressForCohort, [])

                    for (const memberId of membersIdForCohort) {
                        const member = graphConstructInStore("Thing", memberId) ?
                            retrieveGraphConstructs<Thing>("Thing", memberId) as Thing :
                            memberId  
                        
                        childCohort.addMember(member)
                    }

                    prevThing.childThingCohort(directionId, childCohort)
                }
            }
        }

        // Mark the Generation as built.
        this.lifecycleStatus = "built"

    }
    
}