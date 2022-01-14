import type { Thing } from "$lib/models/dbModels/thing"
import type { Cohort } from "$lib/models/graphModels/cohort"

import { retrieveGraphConstructs } from "$lib/stores/graphStores"


export class ThingPlaceholderWidgetModel {
    kind = "thingPlaceholderWidgetModel"

    thingId: number
    thing: Thing | null
    parentCohort: Cohort | null = null

    constructor(thingId: number) {
        this.thingId = thingId
        this.thing = retrieveGraphConstructs("Thing", thingId)
    }
}