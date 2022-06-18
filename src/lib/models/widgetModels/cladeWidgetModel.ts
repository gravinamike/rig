import type { NoteDbModel } from "$lib/models/dbModels"
import type { Graph } from "$lib/models/graphModels"
import type { ThingWidgetModel, ThingCohortWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"


export class CladeWidgetModel {
    kind = "cladeWidgetModel"

    submodels: {
        rootThing: ThingWidgetModel,
        childThingCohorts: ThingCohortWidgetModel[]
        childRelationshipCohortsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel }
    }
    graph: Graph

    constructor(rootThingWidgetModel: ThingWidgetModel, graph: Graph) {
        this.submodels = {
            rootThing: rootThingWidgetModel,
            childThingCohorts: rootThingWidgetModel.childThingCohortWidgetModels,
            childRelationshipCohortsByHalfAxisId: rootThingWidgetModel.relationshipsWidgetModelsByHalfAxisId
        }
        this.graph = graph
    }

    get overlapMarginStyleText(): string {
        const betweenThingOverlap = this.graph.graphWidgetStyle.betweenThingOverlap
        let overlapMarginStyleText: string
        if (this.submodels.rootThing.parentCohort.members.length === 1) {
            overlapMarginStyleText = ""
        } else if (this.submodels.rootThing.address.indexInCohort === 0) {
            overlapMarginStyleText = this.submodels.rootThing.parentCohort.rowOrColumn() === "row" ?
                `margin-right: ${betweenThingOverlap / 2}px;` :
                `margin-bottom: ${betweenThingOverlap / 2}px;`
        } else if (this.submodels.rootThing.address.indexInCohort === this.submodels.rootThing.parentCohort.members.length - 1) {
            overlapMarginStyleText = this.submodels.rootThing.parentCohort.rowOrColumn() === "row" ?
                `margin-left: ${betweenThingOverlap / 2}px;` :
                `margin-top: ${betweenThingOverlap / 2}px;`
        } else {
            overlapMarginStyleText = this.submodels.rootThing.parentCohort.rowOrColumn() === "row" ?
                `margin-left: ${betweenThingOverlap / 2}px; margin-right: ${betweenThingOverlap / 2}px;` :
                `margin-top: ${betweenThingOverlap / 2}px; margin-bottom: ${betweenThingOverlap / 2}px;`
        }
        return overlapMarginStyleText
    }
    
    get note(): NoteDbModel | null {
        return this.submodels.rootThing.note
    }
}