<script lang="ts">
    import type { SpaceDbModel } from "$lib/models/dbModels/clientSide"
    import DirectionWidget from "../directionsViewer/directionWidget.svelte"
    import { DirectionWidget as DirectionDropdownWidget, type GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { sleep } from "$lib/shared/utility"

    export let model: SpaceDbModel
    export let graphWidgetStyle: GraphWidgetStyle


    let spaceNameInput: HTMLInputElement
    /*let directionNameInput1: HTMLInputElement
    let directionNameInput2: HTMLInputElement
    let directionNameInput3: HTMLInputElement
    let directionNameInput4: HTMLInputElement*/
    
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "display"

    const handleButton = async () => {
        if (interactionMode === "display") {
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.
            spaceNameInput.focus()
        } else {
            interactionMode = "display"
        }
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
    on:dblclick={() => { if (interactionMode = "display") handleButton() }}     
>
    <div class="space-name">
        <div class="space-id">
            {model.id}
        </div>

        <div>
            {#if interactionMode === "display"}
                {model.text}
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
        {#each model.directions as directionModel}
            {#if interactionMode === "display"}
                <DirectionWidget
                    model={directionModel}
                />
            {:else}
                <!-- Make the models Directions, and feed them in here. ################### -->
                <!-- Make 4 of these and feed in halfAxisId. -->
                <DirectionDropdownWidget
                    direction={null}
                    halfAxisId={null}
                    {graphWidgetStyle}
                    optionClickedFunction={(direction, _, option) => {
                        console.log(direction, option)

                    }}
                    optionHoveredFunction={async (_, option) => {
                        /*if (currentSpace) {
                            const newSpace = alteredSpace(currentSpace, option, arrowInfo.halfAxisId)
                            graph.startingSpace = newSpace
                            await graph.build()
                            addGraphIdsNeedingViewerRefresh(graph.id)
                        }*/
                    }}
                    exitOptionHoveredFunction={async () => {
                        /*graph.startingSpace = originalSpace
                        await graph.build()
                        addGraphIdsNeedingViewerRefresh(graph.id)*/
                    }}
                />
            {/if}
        {/each}
    </div>

    {#if isHovered || interactionMode === "editing" || interactionMode === "create"}
        <div class="container button-container">
            <div
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
            </div>
        </div>
    {/if}
</div>


<style>
    .space-widget {
        border-radius: 7px;

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

    .space-id {
        padding: 0 0.25rem 0 0.25rem;

        font-size: 1rem;
        font-weight: 600;
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
        outline: solid 1px lightgrey;
        outline-offset: -1px;
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
</style>