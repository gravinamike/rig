import { ThingBaseWidgetModel } from "."


export class ThingSpacerWidgetModel extends ThingBaseWidgetModel {
    kind = "thingSpacerWidgetModel" as const

    constructor(thingId: number) {
        super(thingId)
    }
}