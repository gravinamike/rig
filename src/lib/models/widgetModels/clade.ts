import type { Note } from "$lib/models/constructModels"
import type { GraphWidgetModel, ThingWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
import type { ThingCohortWidgetModel } from "$lib/widgets/graphWidgets/basic/thingCohort"


export class CladeWidgetModel {
    kind = "cladeWidgetModel"

    submodels: {
        rootThing: ThingWidgetModel,
        childThingCohorts: ThingCohortWidgetModel[]
        childRelationshipCohortsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel }
    }
    graphWidgetModel: GraphWidgetModel

    constructor(rootThingWidgetModel: ThingWidgetModel, graphWidgetModel: GraphWidgetModel) {
        this.submodels = {
            rootThing: rootThingWidgetModel,
            childThingCohorts: rootThingWidgetModel.childThingCohortWidgetModels,
            childRelationshipCohortsByHalfAxisId: rootThingWidgetModel.relationshipsWidgetModelsByHalfAxisId
        }
        this.graphWidgetModel = graphWidgetModel
    }

    get overlapMarginStyleText(): string {
        const betweenThingOverlap = this.graphWidgetModel.style.betweenThingOverlap
        let overlapMarginStyleText: string
        if (this.submodels.rootThing.thing && this.submodels.rootThing.thing.parentCohort.members.length === 1) {
            overlapMarginStyleText = ""
        } else if (this.submodels.rootThing.thing && this.submodels.rootThing.thing.address.indexInCohort === 0) {
            overlapMarginStyleText = this.submodels.rootThing.thing && this.submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                `margin-right: ${betweenThingOverlap / 2}px;` :
                `margin-bottom: ${betweenThingOverlap / 2}px;`
        } else if (this.submodels.rootThing.thing && this.submodels.rootThing.thing.address.indexInCohort === this.submodels.rootThing.thing.parentCohort.members.length - 1) {
            overlapMarginStyleText = this.submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                `margin-left: ${betweenThingOverlap / 2}px;` :
                `margin-top: ${betweenThingOverlap / 2}px;`
        } else {
            overlapMarginStyleText = this.submodels.rootThing.thing && this.submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                `margin-left: ${betweenThingOverlap / 2}px; margin-right: ${betweenThingOverlap / 2}px;` :
                `margin-top: ${betweenThingOverlap / 2}px; margin-bottom: ${betweenThingOverlap / 2}px;`
        }
        return overlapMarginStyleText
    }
    
    get note(): Note | null {
        return this.submodels.rootThing.note
    }
}