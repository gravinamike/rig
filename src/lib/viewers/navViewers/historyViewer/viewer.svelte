<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"

    // Import constants.
    import { dateDividerOptions } from "$lib/shared/constants"

    // Import stores.
    import {
        uITrimColorStore, uIBackgroundColorStore, uIHeaderColorStore, lightenOrDarkenColorString,
        titleFontStore, titleFontWeightStore, preventEditing,
        pinIdsStore, addPin, removePin, homeThingIdStore, setHomeThingId, removeHomeThing,
        hoveredThingIdStore, openContextCommandPalette
    } from "$lib/stores"

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import related widgets.
    import { Toggle } from "$lib/widgets/layoutWidgets"



    /**
     * @param graph - The Graph that this widget shows the history for.
     * @param useTabbedLayout - Whether to use the full or tabbed layout for the viewer.
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let useTabbedLayout: boolean
    export let rePerspectToThingId: (thingId: number) => Promise<void>



    // Get the UI color for highlighted History entries.
    const highlightedColor = lightenOrDarkenColorString($uITrimColorStore, "lighter", 50)

    // Set up full/unique history toggling.
    let useUniqueHistory = true
    $: graph.history.setUnique(useUniqueHistory)

    // The History to use is the reversed History with date dividers, made
    // reactive to the full/unique history toggle.
    let historyToUse = graph.history.reverseHistoryWithDateDividers
    $: {
        useUniqueHistory
        historyToUse = graph.history.reverseHistoryWithDateDividers
    }

    
    /**
     * Open-History-context-command-palette method.
     * 
     * Opens a context command palette for a History entry.
     * @param event - The mouse event that opens the command palette.
     * @param thingId - The ID of the Thing associated with the History entry.
     */
    function openHistoryContextCommandPalette(event: MouseEvent, thingId: number) {
        // Get the position of the mouse click.
        const position: [number, number] = [ event.clientX, event.clientY ]

        // Set up the command palette's buttons.
        const buttonInfos = [
            (
                $pinIdsStore.includes(thingId) ? {
                    text: "Remove Thing from Pins",
                    iconName: "no-pin",
                    iconHtml: null,
                    isActive: false,
                    onClick: () => {removePin(thingId)}
                } :
                {
                    text: "Add Thing to Pins",
                    iconName: "pin",
                    iconHtml: null,
                    isActive: false,
                    onClick: () => {addPin(thingId)}
                }
            ),
            (
                $homeThingIdStore === thingId ? {
                    text: "Remove as Home-Thing",
                    iconName: "no-home",
                    iconHtml: null,
                    isActive: false,
                    onClick: () => {removeHomeThing()}
                } :
                {
                    text: "Make Home Thing",
                    iconName: "home",
                    iconHtml: null,
                    isActive: false,
                    onClick: () => {setHomeThingId(thingId)}
                }
            )
        ]

        // Open the command palette.
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<!-- History viewer. -->
<div
    class="history-viewer"
    class:on-mobile={onMobile()}
    class:use-tabbed-layout={useTabbedLayout}

    style="background-color: {$uIBackgroundColorStore};"
>

    <!-- Toggle to use unique or full history. -->
    <div
        class="unique-toggle"
        class:toggled={useUniqueHistory}
    >
        Unique
        <Toggle
            bind:toggled={useUniqueHistory}
            tooltipText={
                useUniqueHistory ? "Click to show duplicates in history." :
                "Click to hide duplicates in history."
            }
        />
    </div>

    <!-- Title. -->
    {#if !useTabbedLayout}
        <div
            class="title-container"

            style="
                background-color: {$uIHeaderColorStore};
                font-family: {$titleFontStore ?? "Arial"};
                font-weight: {$titleFontWeightStore ?? 600};
            "
        >
            <img
                src="./icons/history.png"
                alt="History icon"
                width=27px
                height=27px
            >
            <div class="title">
                History
            </div>
        </div>
    {/if}

    <!-- History list. -->
    <div class="content">
        <!-- History entries. -->
        {#each historyToUse as entryOrDivider, index}
            {#if "thingId" in entryOrDivider}
                <!-- History entry. -->
                <div
                    class="box"
                    class:id-not-found={!entryOrDivider.thing}
                    class:home-thing={ entryOrDivider.thingId === $homeThingIdStore }

                    style={
                        entryOrDivider.thingId === $hoveredThingIdStore ? `background-color: ${highlightedColor};` :
                        ""
                    }

                    on:mouseenter={ () => {
                        if (
                            entryOrDivider
                            && "thingId" in entryOrDivider
                        ) hoveredThingIdStore.set(entryOrDivider.thingId)
                    } }
                    on:mouseleave={ () => {
                        hoveredThingIdStore.set(null)
                    } }
                    on:click={ () => {
                        if (
                            entryOrDivider
                            && "thingId" in entryOrDivider
                            && entryOrDivider.thing
                        ) rePerspectToThingId(entryOrDivider.thingId)
                    } }
                    on:contextmenu|preventDefault={ (event) => {
                        if (!$preventEditing && "thingId" in entryOrDivider) {
                            openHistoryContextCommandPalette(event, entryOrDivider.thingId)
                        }
                    } }
                    on:keydown={()=>{}}
                >
                    <!-- Home-Thing icon. -->
                    {#if entryOrDivider.thingId === $homeThingIdStore}
                        <div class="icon-container home">
                            <img
                                src="./icons/home.png"
                                alt="Home indicator"
                            >
                        </div>
                    {/if}
                    
                    <!-- Thing-not-found text (if applicable). -->
                    { entryOrDivider.thing?.text || `(THING ${entryOrDivider.thingId} NOT FOUND IN STORE)` }
                    
                    <!-- Perspective-Thing icon. -->
                    {#if (
                        (useUniqueHistory && entryOrDivider.thingId === graph.history.selectedThingId)
                        || (!useUniqueHistory && ((historyToUse.length - 1) - index) === graph.history.position)
                    )}
                        <div class="icon-container perspective">
                            <img
                                src="./icons/perspective.png"
                                alt="Perspective indicator"
                            >
                        </div>
                    {/if}
                </div>

            <!-- Date divider. -->
            {:else}
                <div class="date-divider">
                    {entryOrDivider.timestamp.toLocaleDateString("en-US", dateDividerOptions)}
                </div>
            {/if}
        {/each}
    </div>
</div>


<style>
    .history-viewer {
        border-radius: 5px;

        position: relative;
        box-sizing: border-box;
        height: 100%;

        display: flex;
        flex-direction: column;
        
        text-align: center;

        overflow: hidden;
    }

    .history-viewer.on-mobile {
        padding: 0 0 0.2rem 0;
        gap: 0.15rem;
    }

    .history-viewer.use-tabbed-layout {
        border-radius: 0 0 5px 5px;
    }

    .title-container {
        background-color: silver;
        
        display: flex;
        flex-direction: row;
        gap: 0.25rem;
        padding: 0.25rem;
        align-items: center;

        line-height: 21px;
    }

    .title {
        height: 20px;
    }

    .unique-toggle {
        position: absolute;
        right: 8px;
        top: 10px;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 5px;

        font-size: 0.75rem;
        color: #585858;
    }

    .history-viewer.on-mobile .unique-toggle {
        right: 4px;
        top: 8px;

        font-size: 0.65rem;
    }

    .unique-toggle:not(.toggled) {
        color: grey;
    }

    .content {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0rem;

        overflow-y: auto;
        scrollbar-width: thin;
    }

    .box {
        position: relative;
        height: max-content;
        
        padding: 0.35rem 0.35rem 0.3rem 0.35rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;
        line-height: 20px;

        cursor: default;
    }

    .history-viewer.on-mobile .box {
        padding: 0.35rem;

        font-size: 0.6rem;
    }

    .box.home-thing {
        padding-left: 28px;
    }

    .history-viewer.on-mobile .box.home-thing {
        padding-left: 22px;
    }

    .id-not-found {
        outline: dashed 1px black;
    }

    .icon-container {
        position: absolute;
        top: 4px;
    }

    .icon-container.home {
        left: 2px;
    }

    .icon-container.perspective {
        right: 2px;
    }

    .icon-container img {
        width: 22px;
        height: 22px;
        opacity: 75%;
    }

    .history-viewer.on-mobile .icon-container img {
        width: 15px;
        height: 15px;
    }

    .date-divider {
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;

        padding: 0.25rem;

        text-align: left;
        font-size: 0.85rem;

        border-bottom: solid 1px lightgrey;

        cursor: default;
    }

    .history-viewer.on-mobile .date-divider {
        font-size: 0.7rem;
    }

    .date-divider:not(:first-child) {
        margin-top: 1rem;
    }
  </style>