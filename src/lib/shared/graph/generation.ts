import type { Graph } from "$lib/shared/graph/graph"
import type { Cohort } from "$lib/shared/graph/cohort"
import type { ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/shared/graph/graphWidgets"


export type GenerationMember = ThingWidgetModel | ThingPlaceholderWidgetModel

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
            return this.graph.generationById(this.id - 1)
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