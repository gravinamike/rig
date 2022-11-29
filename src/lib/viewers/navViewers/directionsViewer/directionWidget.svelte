<script lang="ts">
    import type { Direction } from "$lib/models/constructModels"
    import { getGraphConstructs } from "$lib/stores"
    import { sleep } from "$lib/shared/utility"
    import Arrow from "./arrow.svelte"


    export let direction: Direction
    export let editable = true


    $: oppositeDirection =
        direction.oppositeid ? getGraphConstructs("Direction", direction.oppositeid) as Direction | null :
        null

    let directionNameInput: HTMLInputElement
    let objectNameInput: HTMLInputElement
    let oppositeDirectionNameInput: HTMLInputElement
    let oppositeObjectNameInput: HTMLInputElement

    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "display"


    $: oppositeDisplayMode =
        interactionMode === "editing" || interactionMode === "create" ? "full" :
        isHovered ? "small" :
        "none"

    const directionHeight = 20
    const directionColor = "#000000"
    $: oppositeDirectionHeight =
        oppositeDisplayMode === "small" ? directionHeight / 2 :
        directionHeight
    const oppositeDirectionColor = "#000000"


    async function handleButton() {
        if (interactionMode === "display") {
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.
            directionNameInput.value = direction.text || ""
            objectNameInput.value = direction.nameforobjects || ""
            oppositeDirectionNameInput.value = oppositeDirection?.text || ""
            oppositeObjectNameInput.value = oppositeDirection?.nameforobjects || ""
            directionNameInput.focus()
        } else {
            submit()
            interactionMode = "display"
        }
    }

    function validate() {
        return (
            directionNameInput.value !== ""
            && objectNameInput.value !== ""
            && oppositeDirectionNameInput.value !== ""
            && oppositeObjectNameInput.value !== ""
        ) ? true :
        false
    }

    function submit() {
        const validInputs = validate()
        if (!validInputs) return

        console.log(
            directionNameInput.value,
            objectNameInput.value,
            oppositeDirectionNameInput.value,
            oppositeObjectNameInput.value
        )
    }
</script>


<svelte:body
    on:keyup={(event) => {
        if (event.key === "Escape") interactionMode = "display"
    } }
/>


<div
    class="direction-widget container horizontal"
    style={interactionMode === "editing" || interactionMode === "create" ? "outline: solid 1px lightgrey;" : ""}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {isHovered = false}}
    on:dblclick={() => { if (interactionMode === "display" && editable) handleButton() }}  
>

    <div class="container vertical">

        <!-- Direction. -->
        <div class="container horizontal">
            <div class="container">
                <Arrow
                    svgLength={85}
                    svgHeight={directionHeight}
                    color={directionColor}
                />
                <div class="floating-text">
                    {#if interactionMode === "display"}
                        {direction.text}
                    {:else}
                        <input
                            type="text"
                            placeholder="Direction"
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
                        {direction.nameforobjects}
                    {:else}
                        <input
                            type="text"
                            placeholder="Object"
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
                                    placeholder="Opp object"
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
                                    placeholder="Opp Direction"
                                    bind:this={oppositeDirectionNameInput}
                                />
                            {/if}
                    </div>
                </div>

                
                <div class="container button-container">
                    {#if editable && (isHovered || interactionMode === "editing" || interactionMode === "create")}
                        <button
                            class="button"
                            class:editing={interactionMode === "editing"}
                            class:create={interactionMode === "create"}
                            tabindex=0

                            on:click|stopPropagation={handleButton}
                            
                        >
                            {#if interactionMode === "display"}
                                <img src="./icons/edit-text.png" alt="edit direction" width=15px height=15px />
                            {:else if interactionMode === "editing"}
                                ✓
                            {:else}
                                +
                            {/if}
                        </button>
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
  </style>