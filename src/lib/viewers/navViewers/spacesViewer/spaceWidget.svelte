<script lang="ts">
    import type { Graph, Direction, Space } from "$lib/models/constructModels"
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { ThingDbModel } from "$lib/models/dbModels/clientSide"
    import DirectionWidget from "../directionsViewer/directionWidget.svelte"
    import { DirectionWidget as DirectionDropdownWidget, type GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { sleep } from "$lib/shared/utility"
    import { updateThingDefaultSpace } from "$lib/db/clientSide"
    import { addGraphIdsNeedingViewerRefresh, inferredRelationshipBeingCreatedDirection, storeGraphDbModels } from "$lib/stores"


    export let space: Space
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let setGraphSpace: (space: Space) => void


    $: defaultPerspectiveSpace = 
        graph.pThing?.defaultSpaceId
        && space.id === graph.pThing.defaultSpaceId

    let spaceNameInput: HTMLInputElement
    /*let directionNameInput1: HTMLInputElement
    let directionNameInput2: HTMLInputElement
    let directionNameInput3: HTMLInputElement
    let directionNameInput4: HTMLInputElement*/
    let directionNameInputDirections: (Direction | null)[] = []
    for (const direction of space.directions) directionNameInputDirections.push(direction)
    
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "display"

    $: halfAxisInfos = [
        {
            halfAxisId: 1 as HalfAxisId,
            direction: space.directions.length >= 1 ? space.directions[0] : null
        },
        {
            halfAxisId: 3 as HalfAxisId,
            direction: space.directions.length >= 2 ? space.directions[1] : null
        },
        {
            halfAxisId: 5 as HalfAxisId,
            direction: space.directions.length >= 3 ? space.directions[2] : null
        },
        {
            halfAxisId: 7 as HalfAxisId,
            direction: space.directions.length >= 4 ? space.directions[3] : null
        },
    ]

    function handleClick() {
        setGraphSpace(space)
    }

    async function handleButton() {
        if (interactionMode === "display") {
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.
            spaceNameInput.value = space.text || ""
            spaceNameInput.focus()
        } else {
            submit()
            interactionMode = "display"
        }
    }

    async function setPerspectiveThingDefaultSpace() {
        if (graph.pThing?.id && space.id) {
            await updateThingDefaultSpace(graph.pThing?.id, space.id)
            // Refresh Thing ID in the ThingDBModel store.
            await storeGraphDbModels<ThingDbModel>("Thing", graph.pThing.id, true)
            await graph.setSpace(space)
            addGraphIdsNeedingViewerRefresh(graph.id)
        }
    }

    function submit() {
        console.log(
            directionNameInputDirections
        )
    }
</script>


<svelte:body
    on:keyup={(event) => {
        if (event.key === "Escape") interactionMode = "display"
    } }
/>


<div
    class="space-widget"
    style={interactionMode === "editing" || interactionMode === "create" ? "outline: solid 1px grey;" : ""}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {isHovered = false}}
    on:click={handleClick}
    on:dblclick={() => { if (interactionMode = "display") handleButton() }}
    on:keydown={()=>{}}
>
    <div class="space-name">
        <div>
            {#if interactionMode === "display"}
                {space.text}
            {:else}
                <input
                    type="text"
                    placeholder="Space name"
                    bind:this={spaceNameInput}
                />
            {/if}
        </div>
    </div>

    <div
        style="display: flex; flex-direction: column; gap: 0.25rem;"
    >
        {#each halfAxisInfos as info, index}
            {#if interactionMode === "display"}
                {#if info.direction}
                    <DirectionWidget
                        direction={info.direction}
                        editable={false}
                    />
                {/if}
            {:else}
                {#if info.direction || directionNameInputDirections[index - 1]}
                    <DirectionDropdownWidget
                        direction={info.direction}
                        halfAxisId={info.halfAxisId}
                        {graphWidgetStyle}
                        optionClickedFunction={(direction, _, __) => {
                            directionNameInputDirections[index] = direction
                        }}
                        optionHoveredFunction={async () => {
                        }}
                        exitOptionHoveredFunction={async () => {
                        }}
                    />
                {/if}
            {/if}
        {/each}
    </div>

    {#if isHovered || interactionMode === "editing" || interactionMode === "create"}
        <div class="container button-container">
            <button
                class="button"
                class:editing={interactionMode === "editing"}
                class:create={interactionMode === "create"}
                tabindex=0

                on:click={handleButton}
                on:keypress={(event) => {
                    if (event.key === "Enter") handleButton()
                }}
            >
                {#if interactionMode === "display"}
                    <img src="./icons/edit-text.png" alt="edit direction" width=15px height=15px />
                {:else if interactionMode === "editing"}
                    ✓
                {:else}
                    +
                {/if}
            </button>
        </div>
    {/if}

    {#if defaultPerspectiveSpace || isHovered}
        <div
            class="perspective-space-button"
            class:is-default-perspective={defaultPerspectiveSpace}

            on:click|stopPropagation={setPerspectiveThingDefaultSpace}
            on:keydown={()=>{}}
        >
            <img
                src="./icons/perspective.png"
                alt="Perspective indicator"
                width="25px"
                height="25px"
                style={`opacity: ${ defaultPerspectiveSpace ? 75 : 25 }%;`}
            >
        </div>
    {/if}
</div>


<style>
    .space-widget {
        border-radius: 7px;

        position: relative;
        height: max-content;
        background-color: #e0e0e0;
        
        display: flex;
        flex-direction: column;
        padding: 0.33rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;

        cursor: default;
    }

    .space-widget:hover {
        outline: solid 1px lightgrey;
        background-color: gainsboro;
    }

    .space-widget:active {
        background-color: lightgrey;
    }

    .space-widget:active {
        background-color: lightgrey;
    }

    .space-name {
        display: flex;
        flex-direction: row;
        gap: 5px;

        font-size: 1rem;
    }

    input {
        border: none;

        width: 90%;
        background-color: transparent;

        text-align: center;

        font-size: 1rem;
    }

    .button-container {
        width: 100%;
        height: 15px;

        display: flex;
        flex-direction: row;
        justify-content: flex-end;
    }

    .button {
        border: none;
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px grey;
        
        width: 15px;
        height: 15px;

        display: flex;
        justify-content: center;
        align-items: center;

        font-size: 0.75rem;
        font-weight: 600;

        cursor: pointer;
    }

    .button:hover, .button:focus {
        box-shadow: 2px 2px 5px 1px grey;

        background-color: lightgrey;
    }

    .button:active {
        outline: solid 1px grey;
        box-shadow: 1px 1px 2px 1px grey;

        background-color: grey;
    }

    .button.editing {
        outline-color: #d0f0c0;
        background-color: #d0f0c0;
        color: green;
    }

    .button.editing:hover, .button.editing:focus {
        outline-color: #ace1af;
        background-color: #ace1af;
    }

    .button.editing:active {
        outline-color: #8fbc8f;
        background-color: #8fbc8f;
    }

    .button.create {
        outline-color: #fac3ae;

        background-color: #fac3ae;

        font-size: 1rem;
        color: darkred;
    }

    .button.create:hover, .button.create:focus {
        outline-color: #ffa07a;
        background-color: #ffa07a;
    }

    .button.create:active {
        outline-color: #fa8072;
        background-color: #fa8072;
    }

    .perspective-space-button {
        border-radius: 50%;

        position: absolute;
        width: 26px;
        height: 26px;
        top: 4px;
        right: 4px;
        background-color: rgb(230, 230, 230);

        display: flex;
        justify-content: center;
        align-items: center;

        cursor: pointer;
    }

    .perspective-space-button:hover {
        outline: solid 1px lightgrey;

        background-color: whitesmoke;
    }

    .perspective-space-button.is-default-perspective {
        outline: solid 1px rgb(175, 175, 175);

        background-color: white;
    }
</style>