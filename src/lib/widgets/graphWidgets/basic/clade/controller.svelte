<script lang="ts">
    import type { Note } from "$lib/models/constructModels"
    import type { ThingWidgetController, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
    import type { ThingCohortWidgetModel } from "$lib/widgets/graphWidgets/basic/thingCohort"






    export let rootThingWidgetModel: ThingWidgetController

    export let submodels: {
            rootThing: ThingWidgetController,
            childThingCohorts: ThingCohortWidgetModel[]
            childRelationshipCohortsByHalfAxisId: { [directionId: number]: RelationshipCohortWidgetModel }
        }
    export let note: Note | null
    export let overlapMarginStyleText: string






    $: submodels = {
        rootThing: rootThingWidgetModel,
        childThingCohorts: rootThingWidgetModel.childThingCohortWidgetModels,
        childRelationshipCohortsByHalfAxisId: rootThingWidgetModel.relationshipsWidgetModelsByHalfAxisId
    }

    $: note = submodels.rootThing.note



    $: betweenThingOverlap = graphWidgetStyle.betweenThingOverlap

    $: overlapMarginStyleText =
        submodels.rootThing.thing && submodels.rootThing.thing.parentCohort.members.length === 1 ?
            "" :
            submodels.rootThing.thing && submodels.rootThing.thing.address.indexInCohort === 0 ?
                (
                    submodels.rootThing.thing && submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                        `margin-right: ${betweenThingOverlap / 2}px;` :
                        `margin-bottom: ${betweenThingOverlap / 2}px;`
                ) :
            submodels.rootThing.thing && submodels.rootThing.thing.address.indexInCohort === submodels.rootThing.thing.parentCohort.members.length - 1 ?
                (
                    submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                        `margin-left: ${betweenThingOverlap / 2}px;` :
                        `margin-top: ${betweenThingOverlap / 2}px;`
                ) :
            submodels.rootThing.thing && submodels.rootThing.thing.parentCohort.rowOrColumn() === "row" ?
                `margin-left: ${betweenThingOverlap / 2}px; margin-right: ${betweenThingOverlap / 2}px;` :
                `margin-top: ${betweenThingOverlap / 2}px; margin-bottom: ${betweenThingOverlap / 2}px;`
</script>