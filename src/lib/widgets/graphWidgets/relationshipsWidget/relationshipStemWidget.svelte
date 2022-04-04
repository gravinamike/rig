<script context="module" lang="ts">
    import { sleep } from "$lib/shared/utility"
    import { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels"
</script>

<script lang="ts">
    export let relationshipsWidgetModel: RelationshipsWidgetModel
    export let hoveredThingIdStoreValue: number | null
    export let thingIdOfHoveredRelationship: number | null
    export let stemHovered: boolean
    export let tweenedScale: number

    export let midline: number
    export let stemBottom: number
    export let stemTop: number

    const cohort = relationshipsWidgetModel.cohort
    let graph = relationshipsWidgetModel.graph

    const ofPerspectiveThing = relationshipsWidgetModel.parentThingWidgetModel.address.generationId === 0 ? true : false
    $: relationshipsExist = cohort.members.length ? true : false

    $: thingHovered = cohort.members.map(member => member.thingId).includes(hoveredThingIdStoreValue)
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
        graph = graph
        await sleep(50)// Allow the Thing Form Widget to render.
        const thingFormTextField = document.getElementById("thing-form-text-field")//// Instead find the ThingForm, and access the field as a property.
        thingFormTextField?.focus()
    }
</script>


<g
    class="relationship-stem"
    on:click={addThingForm}
>
    <!-- Hoverable zone of stem. -->
    <line
        class="stem-hover-zone"
        x1="{midline}" y1="{stemBottom}"
        x2="{midline}" y2="{stemTop}"
        style="stroke-width: {15 / tweenedScale};"
        on:mouseenter={()=>{stemHovered = true;}}
        on:mouseleave={()=>{stemHovered = false;}}
        on:mousedown={()=>{stemClicked = true}}
        on:mouseup={()=>{stemClicked = false}}
    />

    <!-- Visual image of stem. -->
    <g
        class="
            stem-image
            {relationshipsExist || ofPerspectiveThing || stemHovered ? "" : "hidden"}
            {stemHovered || relationshipHovered || thingHovered ? "hovered" : ""}
            {stemClicked ? "clicked" : ""}
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
</g>



<style>
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