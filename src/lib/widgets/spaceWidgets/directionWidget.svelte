<script lang="ts">
    // Import types.
    import type { Direction, Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import stores and utility functions.
    import { addGraphIdsNeedingViewerRefresh, getGraphConstructs, storeGraphDbModels } from "$lib/stores"
    import { sleep } from "$lib/shared/utility"

    // Import related widgets.
    import { Arrow } from "$lib/widgets/layoutWidgets"
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"

    // Import API methods.
    import { updateDirection } from "$lib/db/clientSide"


    /**
     * @param direction - The Direction that this widget represents.
     * @param editable - Whether the Direction can be edited through this widget.
     * @param graph - The Graph that the Directions are part of.
     * @param graphWidgetStyle - Controls the visual style of the Graph.
     */
    export let direction: Direction
    export let editable = true
    export let forceExpanded = false
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Object handles for form inputs.
    let directionNameInput: HTMLInputElement
    let objectNameInput: HTMLInputElement

    // Direction-related attributes.
    $: oppositeDirection =
        direction.oppositeid ? getGraphConstructs("Direction", direction.oppositeid) as Direction | null :
        null
    $: oppositeDirectionInForm = oppositeDirection

    // Attributes controlling visual appearance of widget.
    const directionHeight = 20
    const topArrowLength = 85
    const bottomArrowLength = 75
    const directionColor = "#000000"
    $: oppositeDirectionHeight =
        oppositeDisplayMode === "small" ? directionHeight / 2 :
        directionHeight
    const oppositeDirectionColor = "#000000"

    // Attributes indicating interaction state of widget.
    let isHovered = false
    let interactionMode: "display" | "editing" | "create" = "display"
    $: oppositeDisplayMode =
        ( interactionMode === "editing" || interactionMode === "create" || forceExpanded ) ? "full" :
        isHovered ? "small" :
        "none"


    

    /**
     * Handle-button method.
     * 
     * Handles actions that result when the widget's button is clicked.
     */
    async function handleButton() {
        // If the widget is currently in display mode,
        if (interactionMode === "display") {
            // Change it to editing mode.
            interactionMode = "editing"
            await sleep(50) // Allow the fields to finish rendering.

            // Set its initial content.
            directionNameInput.value = direction.text || ""
            objectNameInput.value = direction.nameforobjects || ""

            // Give it keyboard focus.
            directionNameInput.focus()

        // Otherwise (if the widget is in editing mode),
        } else {
            // Submit any changes to the Space.
            await submit()

            // Change the widget back to display mode.
            interactionMode = "display"
        }
    }

    /**
     * Validate method.
     * 
     * Determines whether the current form entries are valid for submission.
     */
    function validate() {
        const valid = 
            // If the name and object name inputs aren't blank, it's valid.
            (
                directionNameInput.value !== ""
                && objectNameInput.value !== ""
            ) ? true :

            // Otherwise it's not valid.
            false

        return valid
    }

    /**
     * Submit method.
     * 
     * Submits any changes to the Space.
     */
    async function submit() {
        // If the current form entries aren't valid, abort.
        const validInputs = validate()
        if (!validInputs || !direction.id) return

        // Update the Direction in the database.
        await updateDirection(
            direction.id,
            directionNameInput.value,
            objectNameInput.value,
            oppositeDirectionInForm?.id || null
        )

        // Update the Direction in the stores.
        await storeGraphDbModels("Direction")
        await storeGraphDbModels("Space")

        // Rebuild and refresh the Graph.
        await graph.build()
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
</script>


<!-- Set up body escape-key handler to disable editing mode. -->
<svelte:body
    on:keyup={(event) => {
        if (event.key === "Escape") interactionMode = "display"
    } }
/>


<!-- Direction widget. -->
<div
    class="direction-widget container horizontal"
    class:editing={interactionMode === "editing"}
    class:create={interactionMode === "create"}

    on:mouseenter={() => {isHovered = true}}
    on:mouseleave={() => {isHovered = false}}
    on:dblclick={() => { if (interactionMode === "display" && editable) handleButton() }}
>

    <div class="container vertical">

        <!-- Direction. -->
        <div class="container horizontal">

            <!-- Direction text. -->
            <div class="container">
                <!-- Arrow. -->
                <Arrow
                    svgLength={topArrowLength}
                    svgHeight={directionHeight}
                    color={directionColor}
                />

                <!-- Text. -->
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

            <!-- Object text. -->
            <div class="container">
                <!-- Box. -->
                <div
                    class="object"
                    style="width: 50px; height: {directionHeight}px;"
                />
                
                <!-- Text. -->
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
                    font-size: 0.5rem;
                "
            >
                <!-- Opposite object text. -->
                <div class="container">
                    <!-- Box. -->
                    <div
                        class="object"
                        style="width: 50px; height: {oppositeDirectionHeight}px;"
                    >
                        <!-- Text. -->
                        <div
                            class="floating-text"
                        >
                            {#if interactionMode === "display"}
                                {oppositeDirection.nameforobjects}
                            {:else}
                                {oppositeDirectionInForm?.nameforobjects || ""}
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Opposite Direction text. -->
                <div class="container">
                    <!-- Arrow. -->
                    <Arrow
                        svgLength={bottomArrowLength}
                        svgHeight={oppositeDirectionHeight}
                        color={oppositeDirectionColor}
                        reversed={true}
                    />

                    <!-- Text. -->
                    <div class="floating-text">
                        {#if interactionMode === "display"}
                            {oppositeDirection.text}
                        {:else}
                            <DirectionDropdownWidget
                                direction={oppositeDirectionInForm}
                                halfAxisId={0}
                                {graphWidgetStyle}
                                fontSize={10}
                                optionClickedFunction={ (option) => {
                                    oppositeDirectionInForm = option
                                } }
                                optionHoveredFunction={ async (_, option) => {
                                    oppositeDirectionInForm = option
                                } }
                                exitOptionHoveredFunction={ async () => {
                                    oppositeDirectionInForm = oppositeDirection
                                } }
                            />
                        {/if}
                    </div>
                </div>

                <!-- Button. -->
                <div class="container button-container">
                    {#if
                        editable
                        && (
                            isHovered
                            || interactionMode === "editing"
                            || interactionMode === "create"
                        )
                    }
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

    .direction-widget.editing, .direction-widget.create {
        outline: solid 1px lightgrey;
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