<script lang="ts">
    /* Type imports. */
    import type { Graph, Thing } from "$lib/models/constructModels"

    /* Store-related imports. */
    import { homeThingIdStore, hoveredThingIdStore, openContextCommandPalette, readOnlyMode, removeHomeThing, removePin, setHomeThingId } from "$lib/stores"


    /**
     * @param  {number} thingId - The ID of the Thing this Widget represents.
     * @param  {Thing | null} thing - The Thing this Widget represents.
     * @param  {(thingId: number) => Promise<void>} rePerspectToThingId - A function that re-perspects the Graph to a given Thing ID.
     */
    export let thingId: number
    export let thing: Thing | null
    export let graph: Graph | null
    export let rePerspectToThingId: (thingId: number) => Promise<void>


    // Store subscriptions.
    let hoveredThingIdStoreValue: number | null
    hoveredThingIdStore.subscribe(value => {hoveredThingIdStoreValue = value})

    // Reactive declarations.
    $: thingText = thing?.text || `(THING ${thingId} NOT FOUND IN STORE)`

    /**
     * Open a context command palette for this Pin.
     * @param  {MouseEvent} event - The mouse event that opens the command palette.
     */
    function openPinContextCommandPalette(event: MouseEvent) {
        const position: [number, number] = [ event.clientX, event.clientY ]
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
        openContextCommandPalette(position, buttonInfos)
    }
</script>


<!-- Pin Widget. -->
<div
    class="
        pin-widget
        { thingId === hoveredThingIdStoreValue ? "hovered-thing" : "" }
        { thing ? "" : "thing-id-not-found" }
    "
    class:home-thing={ thingId === $homeThingIdStore }
    
    on:mouseenter={()=>{hoveredThingIdStore.set(thingId)}}
    on:mouseleave={()=>{hoveredThingIdStore.set(null)}}

    on:click={ () => { if (thing) rePerspectToThingId(thingId) } }
    on:keydown={()=>{}}
    on:contextmenu|preventDefault={ (event) => {if (!$readOnlyMode) openPinContextCommandPalette(event)} }
>
    {#if thingId === $homeThingIdStore}
        <div class="icon-container home">
            <img
                src="./icons/home.png"
                alt="Home indicator"
            >
        </div>
    {/if}

    {thingText}

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
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        position: relative;
        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 10px;

        text-align: left;
        font-size: 0.85rem;

        cursor: default;
    }

    .thing-id-not-found {
        outline: dashed 1px black;
    }

    .pin-widget:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }

    .hovered-thing {
        outline: solid 2px black;
    }

    .pin-widget.home-thing {
        padding-left: 30px;
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
</style>