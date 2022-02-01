import type { Graph, Cohort } from "$lib/models/graphModels"
import type { ThingBaseWidgetModel, ThingWidgetModel, ThingPlaceholderWidgetModel } from "$lib/models/widgetModels"


export type GenerationMember = ThingBaseWidgetModel | ThingWidgetModel | ThingPlaceholderWidgetModel

export class Generation {
    kind = "generation"

    graph: Graph
    id: number
    cohorts: Cohort[] = []
    lifecycleStatus: "new" | "building" | "built" | "stripping" | "stripped" = "new"

    constructor(graph: Graph) {
        this.graph = graph
        this.id = graph.generationIdToBuild
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
}