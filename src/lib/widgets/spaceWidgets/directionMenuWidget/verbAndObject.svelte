<script lang="ts">
    // Import types.
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import type { Direction } from "$lib/models/constructModels"
    import type { HalfAxisId } from "$lib/shared/constants"

    // Import constants.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"

    // Import related widgets.
    import { Arrow } from "$lib/widgets/layoutWidgets"
    import { DirectionWidget } from "$lib/widgets/spaceWidgets"
    import { TextFittingDiv } from "$lib/widgets/layoutWidgets"


    export let direction: Direction | null
    export let halfAxisId: HalfAxisId | null = null
    export let verbAndObjectWidth: number
    export let verbAndObjectHeight: number
    export let opposite: boolean
    export let displayMode: "full" | "small"
    export let interactionMode: "display" | "editing" | "create"
    export let directionInForm: Direction | null = null
    export let graphWidgetStyle: GraphWidgetStyle
    export let directionNameInput: HTMLInputElement | null = null
    export let objectNameInput: HTMLInputElement | null = null


    // Direction color.
    const directionColor = halfAxisId ? relationshipColorByHalfAxisId[halfAxisId] : "grey"
</script>


<!-- Verb and object. -->
<div
    class="container horizontal"
>

    <!-- Verb. -->
    <div
        class="container"

        style="
            {opposite ? "order: 2;" : ""}
            height: 20px;
        "
    >
        <!-- Arrow. -->
        <div
            style="
                opacity: {displayMode === "small" ? 0.66 : 1};
                overflow: visible;
            "
        >
            <Arrow
                svgLength={verbAndObjectWidth * 0.6}
                svgHeight={verbAndObjectHeight}
                color={directionColor}
                simplified={true}
                reversed={opposite}
            />
        </div>

        <!-- Text. -->
        <div
            class="floating-text"

            style={
                opposite ? "margin-left: 12px; width: 85%;" :
                "margin-left: 3px; width: 85%;"
            }
        >
            {#if interactionMode === "display"}
                <TextFittingDiv
                    text={direction?.text || ""}
                    defaultFontSize={12}
                    defaultFontWeight={400}
                />
            {:else}
                {#if opposite}
                    <div style="width: 100%; height: 100%; margin-bottom: 1px;">
                        <DirectionWidget
                            startingDirection={directionInForm}
                            halfAxisId={0}
                            {graphWidgetStyle}
                            height={18}
                            fontSize={10}
                            circularOrRectangular={"rectangular"}
                            forceFullyOpaque={true}
                            optionClickedFunction={ (option) => {
                                directionInForm = option
                                if (option) direction = option
                            } }
                            optionHoveredFunction={ async () => {
                                
                            } }
                            exitOptionHoveredFunction={ async () => {
                                
                            } }
                        />
                    </div>
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
            style="
                width: {verbAndObjectWidth * 0.35}px;
                height: {verbAndObjectHeight}px;
                {displayMode === "small" ? "opacity: 0.66;" : ""}
            "
        />
        
        <!-- Text. -->
        <div class="floating-text">
            {#if interactionMode === "display" || opposite}
                <TextFittingDiv
                    text={direction?.nameforobjects || ""}
                    defaultFontSize={12}
                    defaultFontWeight={400}
                />
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
        gap: 2px;
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
        outline: none;
        border: solid 1px silver;
        border-style: inset;
        border-radius: 3px;

        width: 75%;
        background-color: transparent;

        text-align: center;

        font-size: 0.75rem;
    }

    .object {
        border-radius: 5px;
        box-shadow: 1px 1px 1px 0.5px silver;

        background-color: white;
    }
  </style>