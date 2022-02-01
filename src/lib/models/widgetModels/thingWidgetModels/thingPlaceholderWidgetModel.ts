import { ThingBaseWidgetModel } from "./"


export class ThingPlaceholderWidgetModel extends ThingBaseWidgetModel {
    kind = "thingPlaceholderWidgetModel"

    constructor(thingId: number) {
        super(thingId)
    }
}