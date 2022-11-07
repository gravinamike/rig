<script lang="ts">
    import type { DirectionDbModel } from "$lib/models/dbModels/clientSide"
    import type { Direction } from "$lib/models/constructModels"
    import { getGraphConstructs } from "$lib/stores"
    import Arrow from "./arrow.svelte"
    import { sleep } from "$lib/shared/utility";

    export let model: DirectionDbModel


    $: oppositeDirection =
        model.oppositeid ? getGraphConstructs("Direction", model.oppositeid) as Direction | null :
        null

    let directionNameInput: HTMLInputElement
    let objectNameInput: HTMLInputElement
    let oppositeDirectionNameInput: HTMLInputElement
    let oppositeObjectNameInput: HTMLInputElement

    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "create"

    $: oppositeDisplayMode =//full, small, none
        interactionMode === "editing" || interactionMode === "create" ? "full" :
        "small"

    const directionHeight = 20
    const directionColor = "#000000"
    $: oppositeDirectionHeight =
        oppositeDisplayMode === "small" ? directionHeight / 2 :
        directionHeight
    const oppositeDirectionColor = "#000000"


    const handleButton = async () => {
        if (interactionMode === "display") {
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.
            directionNameInput.focus()
        } else {
            interactionMode = "display"
        }
    }
</script>




<div
    class="direction-widget container horizontal"
    style={interactionMode === "editing" || interactionMode === "create" ? "outline: solid 1px lightgrey;" : ""}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {isHovered = false}}
>

    <div class="container vertical">

        <!-- Direction. -->
        <div class="container horizontal">
            <div class="container direction-id">
                {model.id}
            </div>

            <div class="container">
                <Arrow
                    svgLength={85}
                    svgHeight={directionHeight}
                    color={directionColor}
                />
                <div class="floating-text">
                    {#if interactionMode === "display"}
                        {model.text}
                    {:else}
                        <input
                            type="text"
                            bind:this={directionNameInput}
                        />
                    {/if}
                </div>
            </div>

            <div class="container">
                <div
                    class="object"
                    style="width: 50px; height: {directionHeight}px;"
                />
                
                <div class="floating-text">
                    {#if interactionMode === "display"}
                        {model.nameforobjects}
                    {:else}
                        <input
                            type="text"
                            bind:this={objectNameInput}
                        />
                    {/if}
                </div>
            </div>
        </div>

        <!-- Opposite Direction -->
        {#if oppositeDirection && !(oppositeDisplayMode === "none")}
            <div
                class="container horizontal"
                style="
                    opacity: {oppositeDisplayMode === "small" ? 0.5 : 1};
                    font-size: {oppositeDisplayMode === "small" ? 0.5 : 1}rem;
                "
            >
                <div class="container">
                    <div
                        class="object"
                        style="width: 50px; height: {oppositeDirectionHeight}px;"
                    >
                        <div class="floating-text">
                            {#if interactionMode === "display"}
                                {oppositeDirection.nameforobjects}
                            {:else}
                                <input
                                    type="text"
                                    bind:this={oppositeObjectNameInput}
                                />
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="container">
                    <Arrow
                        svgLength={85}
                        svgHeight={oppositeDirectionHeight}
                        color={oppositeDirectionColor}
                        reversed={true}
                    />

                    <div class="floating-text">
                        {#if interactionMode === "display"}
                                {oppositeDirection.text}
                            {:else}
                                <input
                                    type="text"
                                    bind:this={oppositeDirectionNameInput}
                                />
                            {/if}
                    </div>
                </div>

                
                <div class="container button-container">
                    {#if isHovered || interactionMode === "editing" || interactionMode === "create"}
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
                    {/if}
                </div>
            </div>
        {/if}

    </div>

</div>


<style>
    .direction-widget {
        border-radius: 5px;
        padding: 0.15rem 0.25rem 0.3rem 0.25rem;

        background-color: rgb(244, 244, 244);

        font-size: 0.5rem;

        cursor: default;
    }

    .container {
        position: relative;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
    }

    .horizontal {
        flex-direction: row;
    }

    .vertical {
        flex-direction: column;
    }

    .direction-id {
        padding: 0.25rem 0.25rem 0.25rem 0;

        flex: 1 1 0;

        font-size: 1rem;
        font-weight: 600;
    }

    .floating-text {
        position: absolute;
        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    input {
        border: none;

        width: 75%;
        background-color: transparent;

        text-align: center;

        font-size: 0.5rem;
    }

    .object {
        border-radius: 5px;
        box-shadow: 2px 2px 5px 1px lightgray;

        background-color: white;
    }

    .button-container {
        width: 15px;
        height: 15px;
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