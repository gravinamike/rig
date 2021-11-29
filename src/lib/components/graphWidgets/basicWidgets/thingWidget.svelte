<script lang="ts">
    import type { SvelteComponent } from "svelte"
    import type { Graph } from "$lib/shared/graph/graph"
    import type { ThingWidgetModel } from "$lib/shared/graph/graphWidgets"
    import { pinIdsStore, hoveredThingIdStore } from "$lib/shared/stores/appStores"
    import RelationshipsWidget from "$lib/components/graphWidgets/basicWidgets/relationshipsWidget.svelte"
    import CohortWidget from "$lib/components/graphWidgets/basicWidgets/cohortWidget.svelte"
    import ThingDetailsWidget from "$lib/components/graphWidgets/detailsWidgets/thingDetailsWidget.svelte"
    import { ContextMenuFrame, ContextMenuOption } from "$lib/components/layoutElements/contextMenu"

    export let thingWidgetModel: ThingWidgetModel
    export let graph: Graph
    
    $: thingId = thingWidgetModel.thingId
    $: text = thingWidgetModel.text
    $: note = thingWidgetModel.note
    $: space = thingWidgetModel.space
    $: cohorts = thingWidgetModel.childCohorts
    $: encapsulatingDepth = thingWidgetModel.parentCohort?.encapsulatingDepth || 0
    $: encapsulatingPadding = encapsulatingDepth >= 0 ? 40 : 20
    $: cohortSize = thingWidgetModel.parentCohort?.members.length || 1
    $: thingSize = graph.style.thingSize + encapsulatingPadding * encapsulatingDepth
    $: thingWidth = thingSize
    $: thingHeight = encapsulatingDepth >= 0 ? thingSize : thingSize / cohortSize - 2

    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})
    $: isHoveredThing = thingId === hoveredThingIdStoreValue

    const showNotes = false
    let showDetails = false
    let lockDetails = false

    async function handleClick() {
        await graph.pThingIds([thingId]) // Re-Perspect to this Thing.
        graph.addEntriesToHistory([thingId]) // Add this Thing to the History.
        hoveredThingIdStore.set(null) // Clear the hovered-Thing highlighting.
        graph = graph // Needed for reactivity.
    }

    let contextMenu: SvelteComponent

    function addPin() {
        pinIdsStore.update( (current) => { if (!current.includes(thingId)) current.push(thingId); return current } )
    }
</script>


<main class="thing-widget">
    
    <!-- The Thing itself. -->
    <div
        class="box thing-image { isHoveredThing ? "hovered-thing" : "" }"
        on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
        on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
        on:click={handleClick}
        on:contextmenu|preventDefault={contextMenu.openContextMenu}
        style="border-radius: {8 + 4 * encapsulatingDepth}px; width: {thingWidth}px; height: {thingHeight}px;"
    >
        <div class="thing-text" style="font-size: {encapsulatingDepth >= 0 ? graph.style.thingTextSize : graph.style.thingTextSize / Math.log2(cohortSize)}px">
            {text}
        </div>
        
        {#if ( showDetails || lockDetails ) && thingWidgetModel.thing}
            <div class="thing-details-container" style="top: {thingHeight - 18}px; left: {thingWidth - 18}px;">
                <ThingDetailsWidget
                    thing={thingWidgetModel.thing}
                />
            </div>
        {/if}
        <div
            class="toggle-button {showDetails || lockDetails ? "pressed" : ""}"
            on:click|stopPropagation={()=>{lockDetails = !lockDetails}}
            on:mouseenter={()=>{showDetails = true}}
            on:mouseleave={()=>{showDetails = false}}
            >
        </div>

        <ContextMenuFrame bind:this={contextMenu}>
            <ContextMenuOption
                text="Add Thing to Pins"
                on:click={addPin}
            />
        </ContextMenuFrame>
    </div>

    {#if showNotes}
        {#if note}
            {@html note.text}
        {:else}
            <h2>NO NOTES YET</h2>
        {/if}
    {/if}

    <!-- The Thing's Relationships and child Cohorts. -->
    {#each cohorts as cohort (cohort.address)}
        {#if [1, 2, 3, 4].includes(cohort.address.halfAxisId)}
            <RelationshipsWidget
                {cohort}
                {space}
                {graph}
            />
        {/if}
        <CohortWidget
            {cohort}
            bind:graph
        />
    {/each}

</main>


<style>
    .box {
        box-shadow: 5px 5px 10px 2px lightgray;

        box-sizing: border-box;
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-image {
        position: relative;
    }

    .thing-image:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .thing-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        font-weight: 600;
        overflow-wrap: break-word;
    }

    .thing-details-container {
        position: absolute;
    }

    .toggle-button {
        border-radius: 8px;
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        position: absolute;
        bottom: 1px;
        right: 1px;
        height: 16px;
        width: 16px;

        text-align: center;
        font-size: 0.5rem;
        color: lightgrey;
        
        cursor: pointer;
    }

    .toggle-button.pressed {
        background-color: gainsboro;
    }
</style>