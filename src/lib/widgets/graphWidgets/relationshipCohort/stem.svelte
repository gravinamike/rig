<script lang="ts">
    // Import types.
    import { Thing, type Graph, type ThingCohort } from "$lib/models/constructModels"

    // Import utility functions.
    import { sleep } from "$lib/shared/utility"

    // Import stores.
    import { 
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedDestThingId, inferredRelationshipBeingCreatedDirection,
        addGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    

    export let cohort: ThingCohort
    export let thingIdOfHoveredRelationship: number | null
    export let stemHovered: boolean
    export let tweenedScale: number

    export let midline: number
    export let stemBottom: number
    export let stemTop: number

    export let graph: Graph
    export let relationshipColor: string


    const ofPerspectiveThing = cohort.parentThing && cohort.parentThing.address.generationId === 0 ? true : false
    $: relationshipsExist = cohort.members.length ? true : false

    $: thingHovered = $hoveredThingIdStore && cohort.members.map(member =>  member.thingId).includes($hoveredThingIdStore)
    $: relationshipHovered = thingIdOfHoveredRelationship && cohort.members.map(member => member.thingId).includes(thingIdOfHoveredRelationship)
    let stemClicked = false

    /*
     * Add a blank Thing Form to the related Cohort.
     */
    async function addThingForm() {
        console.log("ADDING")
        if (!graph.formActive) {
            const newThing = new Thing(null)
            cohort.addMember({thingId: null, thing: newThing, alreadyRendered: false})
            graph.formActive = true
        }
        addGraphIdsNeedingViewerRefresh(graph.id)
        await sleep(50)// Allow the Thing Form Widget to render.
        const thingFormTextField = document.getElementById("thing-form-text-field")//// Instead find the ThingForm, and access the field as a property.
        thingFormTextField?.focus()
    }

    $: relatableForCurrentDrag = (
        $relationshipBeingCreatedInfoStore.sourceThingId !== cohort.parentThingId
        && (
            !$inferredRelationshipBeingCreatedDirection ||
            $inferredRelationshipBeingCreatedDirection.id === cohort.direction.oppositeid
        )
    ) ?
        true :
        false

    $: isDragRelateSource = false
        $relationshipBeingCreatedInfoStore.sourceThingId === cohort.parentThingId ? true :
        false
</script>


<svg
    class="relationship-stem"
    style="
        stroke: {relationshipColor};
        fill: {relationshipColor};
    "
    on:click={addThingForm}
>

    <!-- Hoverable zone of stem. -->
    <line
        class="stem-hover-zone"
        x1="{midline}" y1="{stemBottom}"
        x2="{midline}" y2="{stemTop}"
        style="stroke-width: {20 / tweenedScale};"
        on:mouseenter={()=>{stemHovered = true; hoveredRelationshipTarget.set(cohort)}}
        on:mouseleave={()=>{stemHovered = false; stemClicked = false; hoveredRelationshipTarget.set(null)}}
        on:mousedown={event=>{stemClicked = true; if (cohort.parentThingId) enableRelationshipBeingCreated(
            cohort.parentThingId,
            1,
            cohort.halfAxisId,
            cohort.direction,
            [event.clientX, event.clientY]
        )}}
        on:mouseup={ () => {
            stemClicked = false;
            if (relatableForCurrentDrag) setRelationshipBeingCreatedDestThingId(cohort.parentThingId)
        } }
    />

    <!-- Visual image of stem. -->
    <g
        class="
            stem-image
            {relationshipsExist || ofPerspectiveThing || (relatableForCurrentDrag && stemHovered) || isDragRelateSource ? "" : "hidden"}
            {stemHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {stemClicked || isDragRelateSource ? "clicked" : ""}
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