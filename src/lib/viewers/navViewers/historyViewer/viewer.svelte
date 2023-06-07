<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"


    // Import constants.
    import { dateDividerOptions } from "$lib/shared/constants"
    import { onMobile } from "$lib/shared/utility";

    // Import stores.
    import { addPin, homeThingIdStore, hoveredThingIdStore, openContextCommandPalette, pinIdsStore, readOnlyMode, removeHomeThing, removePin, setHomeThingId, uIBackgroundColorStore } from "$lib/stores"

    // Import related widgets.
    import { Toggle } from "$lib/widgets/layoutWidgets"


    /**
     * @param graph - The Graph that this widget shows the history for.
     * 
     * @param rePerspectToThingId - Method to re-Perspect the Graph to a new Thing ID.
     */
    export let graph: Graph
    export let useTabbedLayout: boolean
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    let useUniqueHistory = true
    $: graph.history.setUnique(useUniqueHistory)

    let historyToUse = graph.history.reverseHistoryWithDateDividers
    $: {
        useUniqueHistory

        historyToUse = graph.history.reverseHistoryWithDateDividers
    }
    
    /**
     * Open a context command palette for a History entry.
     * @param  {MouseEvent} event - The mouse event that opens the command palette.
     */
     function openHistoryContextCommandPalette(event: MouseEvent, thingId: number) {
        const position: [number, number] = [ event.clientX, event.clientY ]
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
        />
    </div>

    <!-- Title. -->
    {#if !useTabbedLayout}
        <div class="title">
            <h4>History</h4>
        </div>
    {/if}

    <!-- History list. -->
    <div class="content">
        {#each historyToUse as entryOrDivider, index}

            <!-- History entry. -->
            {#if "thingId" in entryOrDivider}

                <div
                    class="box"
                    class:hovered-thing={entryOrDivider.thingId === $hoveredThingIdStore}
                    class:id-not-found={!entryOrDivider.thing}
                    class:home-thing={ entryOrDivider.thingId === $homeThingIdStore }

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
                        if (!$readOnlyMode && "thingId" in entryOrDivider) {
                            openHistoryContextCommandPalette(event, entryOrDivider.thingId)
                        }
                    } }
                    on:keydown={()=>{}}
                >
                    {#if entryOrDivider.thingId === $homeThingIdStore}
                        <div class="icon-container home">
                            <img
                                src="./icons/home.png"
                                alt="Home indicator"
                            >
                        </div>
                    {/if}
                    
                    { entryOrDivider.thing?.text || `(THING ${entryOrDivider.thingId} NOT FOUND IN STORE)` }
                    
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
                    <hr>
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
        padding: 0.75rem 0 0.75rem 0;
        gap: 1rem;
        
        text-align: center;

        overflow: hidden;
    }

    .history-viewer.on-mobile {
        padding: 0.2rem 0 0.2rem 0;
        gap: 0.15rem;
    }

    .history-viewer.use-tabbed-layout {
        border-radius: 0 0 5px 5px;
    }

    .title {
        height: 20px;
    }

    h4 {
        margin: 0;
    }

    .unique-toggle {
        position: absolute;
        right: 10px;
        top: 13px;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 5px;

        font-size: 0.75rem;
    }

    .history-viewer.on-mobile .unique-toggle {
        right: 4px;
        top: 8px;

        font-size: 0.65rem;
    }

    .unique-toggle.toggled {
        color: darkgrey;
    }

    .content {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.15rem;

        overflow-y: auto;
        scrollbar-width: thin;
    }

    .box {
        border-radius: 10px;

        position: relative;
        height: max-content;
        background-color: white;
        
        padding: 0.5rem;
        gap: 10px;

        font-size: 0.75rem;
        text-align: left;

        cursor: default;
    }

    .history-viewer.on-mobile .box {
        padding: 0.35rem;

        font-size: 0.6rem;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .box.home-thing {
        padding-left: 30px;
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
        background-color: white;
    }

    .icon-container.home {
        left: 4px;
    }

    .icon-container.perspective {
        right: 4px;
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
        text-align: left;
        font-size: 0.85rem;
    }

    .history-viewer.on-mobile .date-divider {
        font-size: 0.7rem;
    }

    .date-divider:not(:first-child) {
        margin-top: 1rem;
    }
  </style>