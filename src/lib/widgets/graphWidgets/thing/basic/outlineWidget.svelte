<script lang="ts">
    /* Type imports. */
    import type { Graph, Thing } from "$lib/models/constructModels"
    import type { HalfAxisId } from "$lib/shared/constants"

    /* Store imports. */
    import {
        graphDbModelInStore, unstoreGraphDbModels,
        hoveredThingIdStore, hoveredRelationshipTarget,
        relationshipBeingCreatedInfoStore, enableRelationshipBeingCreated,
        setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated,
        pinIdsStore, openContextCommandPalette, addPin, removePin,
    } from "$lib/stores"

    /* Widget imports. */
    import { ThingDetailsWidget } from "$lib/widgets/detailsWidgets"
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"
    import type { GraphWidgetStyle } from "../../graph";

    import ThingWidgetController from "./controller.svelte"


    /**
     * @param  {ThingWidgetModel} thingWidgetModel - The Thing Widget Model used to set up this Widget.
     * @param  {Graph} graph - The Graph that the Thing is in.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let rePerspectToThingId: (id: number) => Promise<void>


    let planeId: number
    let encapsulatingDepth: number = 0
    let thingSize: number
    let xYElongation: {x: number, y: number}
    let cohortSize: number = 0
    let thing: Thing
    let halfAxisId: HalfAxisId
    let elongationCategory: "vertical" | "horizontal" | "neutral"
    let thingWidgetId: string
    let isEncapsulating: boolean
    let relatableForCurrentDrag: boolean
    let thingWidth: number
    let thingHeight: number 


    


    
    /* Variables dealing with visual formatting of the Thing itself (color, opacity, outline, etc.). */
    let isHoveredWidget = false
    $: isHoveredThing = thingId === $hoveredThingIdStore
    $: relationshipBeingCreated = false/*$relationshipBeingCreatedInfoStore.sourceWidgetModel ? true : false*/
    $: highlighted = isHoveredThing && !(relationshipBeingCreated && !relatableForCurrentDrag) ? true : false

    /* Variables dealing with visual formatting of the Thing's text. */
    let textFontSize = encapsulatingDepth >= 0 ?
        graphWidgetStyle.thingTextSize :
        graphWidgetStyle.thingTextSize / Math.log2(cohortSize)

    /* Variables dealing with associated components. */
    const showContent = false // Content is in development - so `showContent` will eventually be a variable.
    let confirmDeleteBoxOpen = false

    
    /**
     * Initiate a delete operation (which needs to be confirmed to finish).
     */
    async function startDelete() {
        confirmDeleteBoxOpen = true
    }

    /**
     * Complete a delete operation after it has been confirmed.
     */
     async function completeDelete() {
        await graph.deleteThingById(thingId)
        await unstoreGraphDbModels("Thing", thingId)

        const reverseHistory = graph.history._entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        for (const historyEntry of reverseHistory) {
            if (historyEntry.thingId !== thingId && graphDbModelInStore("Thing", historyEntry.thingId)) {
                rePerspectToThingId(historyEntry.thingId)
                break
            }
        }
    }

    /**
     * Open a context command palette for this Thing.
     * 
     * @param  {MouseEvent} event - The right-click mouse event that triggered the context command palette.
     */
    function openCommandPalette(event: MouseEvent) {
        const position = [event.clientX, event.clientY] as [number, number]
        const buttonInfos = $pinIdsStore.includes(thingId) ?
            [{ text: "Remove Thing from Pins", iconName: "no-pin", iconHtml: null, isActive: false, onClick: () => {removePin(thingId)} }] :
            [{ text: "Add Thing to Pins", iconName: "pin", iconHtml: null, isActive: false, onClick: () => {addPin(thingId)} }]
        openContextCommandPalette(position, buttonInfos)
    }
</script>





<ThingWidgetController
    {thingId}
    {graph}
    {graphWidgetStyle}

    bind:planeId
    bind:encapsulatingDepth
    bind:thingSize
    bind:thingWidth
    bind:thingHeight
    bind:xYElongation
    bind:cohortSize

    bind:thingWidgetId
    bind:thing
    bind:halfAxisId
    bind:elongationCategory
    bind:isEncapsulating
    bind:relatableForCurrentDrag
/>




<!-- Thing Widget. -->
{#if thing}
    <div
        id="{thingWidgetId}"
        class="box thing-outline-widget" class:highlighted
        style="
            border-radius: { thing.childThingCohorts.length ? "10px 10px 0 0" : "10px" };
        "

        on:mouseenter={()=>{
            hoveredThingIdStore.set(thingId)
            isHoveredWidget = true, hoveredRelationshipTarget.set(thing)
        }}
        on:mouseleave={()=>{
            hoveredThingIdStore.set(null)
            isHoveredWidget = false
            confirmDeleteBoxOpen = false, hoveredRelationshipTarget.set(null)
        }}
        on:mousedown={ event => {if (event.button === 0) {
            enableRelationshipBeingCreated(
                graph,
                graphWidgetStyle,
                thingId,
                1,
                halfAxisId,
                thing.parentCohort.direction,
                [event.clientX, event.clientY]
            )
        }}}
        on:click={ () => {if ($relationshipBeingCreatedInfoStore.sourceThingId === null) rePerspectToThingId(thingId) } }
        on:mouseup={ () => {
            if (relatableForCurrentDrag) {
                setRelationshipBeingCreatedDestThingId(thingId)
            } else {
                disableRelationshipBeingCreated()
            }
        } }
        on:contextmenu|preventDefault={openCommandPalette}
    >
        <!-- Thing text. -->
        <div
            class="text-container"
            class:horizontal={showContent && elongationCategory === "horizontal"}
            class:sideways={showContent && elongationCategory !== "horizontal"}
            style="width: 100%;"
        >
            <div
                class="thing-text"
                class:encapsulating={isEncapsulating}
                class:show-content={showContent}
                class:hide-content={!showContent}
                style="width: 100%; font-size: {textFontSize}px;"
            >
                {thing.text}
            </div>
        </div>

        <!-- Content box. -->
        {#if showContent && thing.dbModel}
            <div 
                class="content-box"
                class:horizontal={elongationCategory === "horizontal"}
                class:vertical={!(elongationCategory === "horizontal")}
            >
                <ThingDetailsWidget
                    thingDbModel={thing.dbModel}
                    freestanding={false}
                />
            </div>
        {/if}

        <!-- Delete button and confirm delete dialog. -->
        {#if isHoveredWidget && !confirmDeleteBoxOpen}
            <div class="delete-button-container">
                <XButton
                    buttonFunction={startDelete}
                />
            </div>
        {/if}
        {#if confirmDeleteBoxOpen}
            <ConfirmDeleteBox
                {thingWidth}
                {thingHeight}
                {encapsulatingDepth}
                {elongationCategory}
                confirmDeleteFunction={completeDelete}
            />
        {/if}
    </div>
{/if}


<style>
    .box {
        height: max-content;
        background-color: white;

        cursor: default;
    }

    .thing-outline-widget {        
        position: relative;

        padding: 1rem;

        pointer-events: auto;
    }

    .highlighted {
        outline: solid 2px black;
        outline-offset: -2px;
    }

    .text-container {
        left: 0;
        
        text-align: center;
    }

    .text-container.sideways {
        transform: rotate(-90deg);
    }

    .thing-text {
        font-weight: 600;
    }

    .thing-text.encapsulating {
        position: absolute;
        transform: translate(0%, -50%);

        white-space: nowrap;
    }

    .thing-text.show-content {
        text-align: center;
    }

    .thing-text.hide-content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        
        overflow-wrap: break-word;
    }

    .delete-button-container {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 1;
    }

    .content-box {
        outline: inset 1px lightgrey;
        outline-offset: -1px;

        position: absolute;
        background-color: white;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .content-box.horizontal {
        border-radius: 0 6px 6px 0;
        
        width: calc(100% - 50px);
        height: calc(100% - 10px);
        top: 5px;
        right: 5px;
    }

    .content-box.vertical {
        border-radius: 0 0 6px 6px;

        width: calc(100% - 10px);
        height: calc(100% - 50px);
        bottom: 5px;
        left: 5px;
    }
</style>