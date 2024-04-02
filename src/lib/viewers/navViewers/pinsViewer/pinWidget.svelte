<script lang="ts">
    /* Import types. */
    import type { Graph, Thing } from "$lib/models/constructModels"

    /* Import stores. */
    import {
        uITrimColorStore, lightenOrDarkenColorString, preventEditing,
        removePin, homeThingIdStore, setHomeThingId, removeHomeThing,
        hoveredThingIdStore, openContextCommandPalette
    } from "$lib/stores"

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"



    /**
     * @param thingId - The ID of the Thing this Widget represents.
     * @param thing - The Thing this Widget represents.
     * @param graph - The Graph that the Thing is Pinned for.
     * @param rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null
    export let graph: Graph | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>



    // Get the UI color for highlighted Pin widgets.
    const highlightedColor = lightenOrDarkenColorString($uITrimColorStore, "lighter", 50)
    
    // The text of the Pinned Thing.
    $: thingText = thing?.text || `(THING ${thingId} NOT FOUND IN STORE)`


    /**
     * Open a context command palette for this Pin.
     * @param  {MouseEvent} event - The mouse event that opens the command palette.
     */
    function openPinContextCommandPalette(event: MouseEvent) {
        // Get the position of the mouse click.
        const position: [number, number] = [ event.clientX, event.clientY ]

        // Set up the button infos for the command palette.
        const buttonInfos = [
            {
                text: "Remove Thing from Pins",
                iconName: "no-pin",
                iconHtml: null,
                isActive: false,
                onClick: () => {removePin(thingId)}
            },
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


<!-- Pin Widget. -->
<div
    class="pin-widget"
    class:on-mobile={onMobile()}
    class:thing-id-not-found={!thing}
    class:home-thing={ thingId === $homeThingIdStore }

    style={thingId === $hoveredThingIdStore ? `background-color: ${highlightedColor};` : ""}
    
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}
    on:click={ () => { if (thing) rePerspectToThingId(thingId) } }
    on:keydown={()=>{}}
    on:contextmenu|preventDefault={ (event) => {if (!$preventEditing) openPinContextCommandPalette(event)} }
>
    <!-- Home-Thing icon. -->
    {#if thingId === $homeThingIdStore}
        <div class="icon-container home">
            <img
                src="./icons/home.png"
                alt="Home indicator"
            >
        </div>
    {/if}

    <!-- Text of the Pinned Thing. -->
    {thingText}

    <!-- Perspective-Thing icon. -->
    {#if (thingId === graph?.history.selectedThingId)}
        <div class="icon-container perspective">
            <img
                src="./icons/perspective.png"
                alt="Perspective indicator"
            >
        </div>
    {/if}
</div>


<style>
    .pin-widget {
        position: relative;
        height: max-content;
        
        display: flex;
        flex-direction: column;
        padding: 0.2rem 0.66rem 0.1rem 0.66rem;
        gap: 10px;

        font-size: 0.85rem;
        text-align: left;
        line-height: 30px;

        cursor: default;
    }

    .pin-widget.on-mobile {
        padding: 0.35rem;

        font-size: 0.7rem;
    }

    .thing-id-not-found {
        outline: dashed 1px black;
    }

    .pin-widget.home-thing {
        padding-left: 32px;
    }

    .pin-widget.on-mobile.home-thing {
        padding-left: 25px;
    }

    .icon-container {
        position: absolute;
        top: 6px;
    }

    .icon-container.home {
        left: 6px;
    }

    .icon-container.perspective {
        right: 4px;
    }

    .icon-container img {
        width: 22px;
        height: 22px;
        opacity: 75%;
    }

    .pin-widget.on-mobile .icon-container img {
        width: 17px;
        height: 17px;
    }
</style>