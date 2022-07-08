<script context="module" lang="ts">
    import type { Graph } from "$lib/models/graphModels"
    import { sleep } from "$lib/shared/utility"
    import { relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated, setRelationshipBeingCreatedDestWidgetModel, hoveredThingIdStore, hoveredRelationshipTarget, inferredRelationshipBeingCreatedDirection, addGraphIdsNeedingViewerRefresh } from "$lib/stores"
    import { ThingWidgetModel, RelationshipCohortWidgetModel } from "$lib/models/widgetModels"
</script>

<script lang="ts">
    export let relationshipsWidgetModel: RelationshipCohortWidgetModel
    export let thingIdOfHoveredRelationship: number | null
    export let stemHovered: boolean
    export let tweenedScale: number

    export let midline: number
    export let stemBottom: number
    export let stemTop: number

    export let graph: Graph

    const cohort = relationshipsWidgetModel.cohort

    const ofPerspectiveThing = relationshipsWidgetModel.parentThingWidgetModel.address.generationId === 0 ? true : false
    $: relationshipsExist = cohort.members.length ? true : false

    $: thingHovered = cohort.members.map(member => member.thingId).includes($hoveredThingIdStore)
    $: relationshipHovered = cohort.members.map(member => member.thingId).includes(thingIdOfHoveredRelationship)
    let stemClicked = false

    /*
     * Add a blank Thing Form to the related Cohort.
     */
    async function addThingForm() {
        const newThingWidgetModel = new ThingWidgetModel(null, graph)
        if (!graph.formActive) {
            cohort.addMember(newThingWidgetModel)
            graph.formActive = true
        }
        addGraphIdsNeedingViewerRefresh(graph.id)
        await sleep(50)// Allow the Thing Form Widget to render.
        const thingFormTextField = document.getElementById("thing-form-text-field")//// Instead find the ThingForm, and access the field as a property.
        thingFormTextField?.focus()
    }

    $: relatableForCurrentDrag = (
        $relationshipBeingCreatedInfoStore.sourceWidgetModel !== relationshipsWidgetModel.parentThingWidgetModel
        && (
            !$inferredRelationshipBeingCreatedDirection ||
            $inferredRelationshipBeingCreatedDirection.id === relationshipsWidgetModel.direction.oppositeid
        )
    ) ?
        true :
        false
</script>


<svg
    class="relationship-stem"
    style="
        stroke: {relationshipsWidgetModel.relationshipColor};
        fill: {relationshipsWidgetModel.relationshipColor};
    "
    on:click={addThingForm}
>

    <!-- Hoverable zone of stem. -->
    <line
        class="stem-hover-zone"
        x1="{midline}" y1="{stemBottom}"
        x2="{midline}" y2="{stemTop}"
        style="stroke-width: {20 / tweenedScale};"
        on:mouseenter={()=>{stemHovered = true; hoveredRelationshipTarget.set(relationshipsWidgetModel)}}
        on:mouseleave={()=>{stemHovered = false; stemClicked = false; hoveredRelationshipTarget.set(null)}}
        on:mousedown={event=>{stemClicked = true; enableRelationshipBeingCreated(
            relationshipsWidgetModel,
            [event.clientX, event.clientY]
        )}}
        on:mouseup={ () => {
            stemClicked = false;
            if (relatableForCurrentDrag) setRelationshipBeingCreatedDestWidgetModel(relationshipsWidgetModel)
        } }
    />

    <!-- Visual image of stem. -->
    <g
        class="
            stem-image
            {relationshipsExist || ofPerspectiveThing || (relatableForCurrentDrag && stemHovered) || $relationshipBeingCreatedInfoStore.sourceWidgetModel === relationshipsWidgetModel ? "" : "hidden"}
            {stemHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {stemClicked || $relationshipBeingCreatedInfoStore.sourceWidgetModel === relationshipsWidgetModel ? "clicked" : ""}
        "
    >
        <line
            x1="{midline}" y1="{stemBottom}"
            x2="{midline}" y2="{stemTop + 6 / tweenedScale}"
            style="stroke-width: {10 / tweenedScale};"
        />
        <polygon
            points="
                {midline - 5 / tweenedScale}, {stemTop + 8 / tweenedScale}
                {midline + 5 / tweenedScale}, {stemTop + 8 / tweenedScale}
                {midline}, {stemTop}
            "
            style="stroke-width: {3 / tweenedScale};"
        />
    </g>

</svg>


<style>
    svg {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .stem-hover-zone {
        opacity: 0;

        pointer-events: auto;
        cursor: pointer;
    }

    .stem-image {
        opacity: 0.25;
    }

    .stem-image.hidden {
        visibility: hidden;
    }

    .stem-image.hovered {
        opacity: 0.5;
    }

    .stem-image.clicked {
        opacity: 1.0;
    }
</style>