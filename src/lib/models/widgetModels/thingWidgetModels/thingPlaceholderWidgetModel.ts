import { ThingBaseWidgetModel } from "./"


export class ThingPlaceholderWidgetModel extends ThingBaseWidgetModel {
    kind = "thingPlaceholderWidgetModel" as const

    constructor(thingId: number) {
        super(thingId)
    }
}