import type { Thing } from "$lib/shared/graph/constructs/thing"
import type { Cohort } from "$lib/shared/graph/cohort"

import { retrieveGraphConstructs } from "$lib/shared/stores/graphStores"


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