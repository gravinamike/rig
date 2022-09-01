import type { HalfAxisId } from "$lib/shared/constants"
import type { Thing, Graph } from "$lib/models/graphModels"
import type { GraphWidgetModel } from "../graphWidgetModel"
import type { ThingCohortWidgetModel, ThingWidgetModel } from "$lib/models/widgetModels"

import { planePadding } from "$lib/shared/constants"
import { retrieveGraphConstructs } from "$lib/stores"


export class ThingBaseWidgetModel {
    kind = "thingBaseWidgetModel"

    thingId: number | null
    thing: Thing | null
    graphWidgetModel: GraphWidgetModel
    graph: Graph
    parentThingCohortWidgetModel: ThingCohortWidgetModel | null

    constructor(thingId: number | null, graphWidgetModel: GraphWidgetModel, parentThingCohortWidgetModel: ThingCohortWidgetModel) {
        this.thingId = thingId
        this.thing = typeof thingId === "number" ? retrieveGraphConstructs("Thing", thingId) : null
        this.graphWidgetModel = graphWidgetModel
        this.graph = graphWidgetModel.graph
        this.parentThingCohortWidgetModel = parentThingCohortWidgetModel
    }

    // The following getter functions pass along the corresponding attributes from the encapsulated Thing.
    get relatedThingIds(): (number | null)[] {
        const relatedThingIds = this.thing ? this.thing.relatedThingIds : []
        return relatedThingIds
    }

    get relatedThingIdsByDirectionId(): { [directionId: number]: number[] } {
        const relatedThingIdsByDirectionId = this.thing ? this.thing.relatedThingIdsByDirectionId : {}
        return relatedThingIdsByDirectionId
    }


    get parentThingWidgetModel(): ThingWidgetModel | null {
        return this.parentThingCohortWidgetModel?.parentThingWidgetModel || null
    }



    // The following getter functions pass along the corresponding attributes from the Thing Widget's Cohort.
    get parentThingId(): number | null {
        const parentThingId = this.thing?.parentCohort?.address ?
            this.thing.parentCohort.address.parentThingId :
            null
        return parentThingId
    }

    get halfAxisId(): HalfAxisId | 0 {
        return this.thing?.parentCohort.halfAxisId || 0
    }

    get encapsulatingDepth(): number {
        return this.thing?.parentCohort.encapsulatingDepth || 0
    }

    // The following getter functions are derived from the pass-along getter functions above.

    get cohortSize(): number {
        return this.thing?.parentCohort.members.length || 1
    }

    get planeId(): number {
        const planeId = [7, 8].includes(this.halfAxisId) && this.thing?.parentThing ?
            // If the Thing is on the encapsulating axis, inherit the Plane from the Thing's parent Thing.
            this.thing.parentThing.parentCohort.plane?.id || 0 :
            // Otherwise use the Thing's own Plane.
            this.thing?.parentCohort.plane?.id || 0
        return planeId
    }















    get elongation(): number {
        return this.thing?.parentCohort.axialElongation || 1
    }

    get elongationCategory(): "vertical" | "horizontal" | "neutral" {
        const elongationCategory = [1, 2, 3, 4].includes(this.halfAxisId) ?
            ( [1, 2].includes(this.halfAxisId) ? "vertical" : "horizontal" ) :
            "neutral"
        return elongationCategory
    }

    get xYElongation(): {x: number, y: number} {
        const elongation = this.elongation
        let xYElongation: {x: number, y: number}
        switch (this.elongationCategory) {
            case "vertical": 
                xYElongation = {x: 1, y: elongation}; break
            case "horizontal":
                xYElongation = {x: elongation, y: 1}; break
            case "neutral":
                xYElongation = {x: elongation, y: elongation}; break
        }
        return xYElongation
    }











    



    get encapsulatingPadding(): number {
        return this.encapsulatingDepth >= 0 ? 40 : 20
    }


    get thingSize(): number {
        return (
            this.graphWidgetModel.graphWidgetStyle.thingSize
            + planePadding * this.planeId
            + this.encapsulatingPadding * this.encapsulatingDepth
        )
    } 

    get thingWidth(): number {
        return this.thingSize * this.xYElongation.x
    }

    get thingHeight(): number {
        return this.encapsulatingDepth >= 0 ?
            this.thingSize * this.xYElongation.y :
            this.thingSize * this.xYElongation.y / this.cohortSize - 2
    }





}