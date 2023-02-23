<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"

    // Import related widgets.
    import { Arrow } from "$lib/widgets/layoutWidgets"
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"


    export let direction: Direction
    export let verbAndObjectWidth: number
    export let verbAndObjectHeight: number
    export let opposite: boolean
    export let displayMode: "full" | "small"
    export let interactionMode: "display" | "editing" | "create"
    export let oppositeDirectionInForm: Direction | null = null
    export let graphWidgetStyle: GraphWidgetStyle


    // Object handles for form inputs.
    let directionNameInput: HTMLInputElement
    let objectNameInput: HTMLInputElement

    // Direction color.
    const directionColor = "#000000"
</script>


<!-- Verb and object. -->
<div
    class="container horizontal"

    style="
        opacity: {displayMode === "small" ? 0.66 : 1};
    "
>

    <!-- Verb. -->
    <div
        class="container"

        style="{opposite ? "order: 2;" : ""}"
    >
        <!-- Arrow. -->
        <Arrow
            svgLength={verbAndObjectWidth * 0.6}
            svgHeight={verbAndObjectHeight}
            simplified={true}
            color={directionColor}
            reversed={opposite}
        />

        <!-- Text. -->
        <div class="floating-text">
            {#if interactionMode === "display"}
                {direction.text}
            {:else}
                {#if opposite}
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
                            oppositeDirectionInForm = direction
                        } }
                    />
                {:else}
                    <input
                        type="text"
                        placeholder="Direction"
                        bind:this={directionNameInput}
                    />
                {/if}
            {/if}
        </div>
    </div>

    <!-- Object. -->
    <div class="container">
        <!-- Box. -->
        <div
            class="object"
            style="width: {verbAndObjectWidth * 0.35}px; height: {verbAndObjectHeight}px;"
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


<style>
    .container {
        position: relative;

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
    }

    .horizontal {
        flex-direction: row;
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

        background-color: white;
    }
  </style>