<script lang="ts">
    // Import types.
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Graph, Space } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import constants and utility functions.
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { sleep } from "$lib/shared/utility"
    
    // Import stores.
    import { addGraphIdsNeedingViewerRefresh, mouseSpeed } from "$lib/stores"

    // Imort Space-manipulation functions.
    import { copiedSpace, alteredSpace } from "$lib/models/constructModels"

    // Import related widgets.
    import { DirectionDropdownWidget } from "$lib/widgets/spaceWidgets"


    /**
     * @param graph - The Graph whose Space is being controlled by this widget.
     * @param graphWidgetStyle - Controls the visual styling of the Graph.
     * @param currentSpace - The Space in which the Graph is currently being rendered.
     */
    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let currentSpace: Space | null


    // The "original Space" keeps track of the first Space the Graph is set to.
    let originalSpace: Space | null
    // If the original Space hasn't yet been set, set it to the current Space.
    let originalSpaceSet = false
    $: if (currentSpace !== null && !originalSpaceSet) {
        originalSpace = copiedSpace(currentSpace)
        originalSpaceSet = true
    }

    // Array of objects with information to set up each arrow.
    $: arrowInfos = [
        {
            rotation: 0,
            color: relationshipColorByHalfAxisId[2],
            directionSigns: [0, -1],
            direction: currentSpace?.directionByHalfAxisId[2] || null,
            halfAxisId: 2 as HalfAxisId
        },
        {
            rotation: 90,
            color: relationshipColorByHalfAxisId[3],
            directionSigns: [1, 0],
            direction: currentSpace?.directionByHalfAxisId[3] || null,
            halfAxisId: 3 as HalfAxisId
        },
        {
            rotation: 180,
            color: relationshipColorByHalfAxisId[1],
            directionSigns: [0, 1],
            direction: currentSpace?.directionByHalfAxisId[1] || null,
            halfAxisId: 1 as HalfAxisId
        },
        {
            rotation: 270,
            color: relationshipColorByHalfAxisId[4],
            directionSigns: [-1, 0],
            direction: currentSpace?.directionByHalfAxisId[4] || null,
            halfAxisId: 4 as HalfAxisId
        }
    ]

    // Attributes that configure appearance of widget border.
    const shape: "rectangle" | "circle" = "rectangle"
    const borderThickness = 20

    let borderWidth: number | undefined
    let borderHeight: number | undefined
    $: borderCenterX = borderWidth ? borderWidth / 2 : 0
    $: borderCenterY = borderHeight ? borderHeight / 2 : 0
    $: borderRadius = Math.min(borderCenterX, borderCenterY)
    $: widthToHeightRatio = borderWidth && borderHeight ? borderWidth / borderHeight : 0

    // Attributes that detemine when the widget border is active.
    let borderHovered = false
    let spaceFrameActive = false

    /**
     * Set-Space-Frame-active-if-slow method.
     * 
     * If the mouse is hovering over the border while it is moving slowly, set
     * the SpaceFrame to active (visible and interactible). This prevents the
     * border from activating inappropriately when the user is just passing over
     * it.
     */
    async function setSpaceFrameActiveIfSlow() {
        if (borderHovered === true && mouseSpeed() < 50) spaceFrameActive = true
    }

    /**
     * Delayed-set-Space-Frame-inactive method.
     * 
     * Sets the Space Frame to inactive (invisible and not interactible) one
     * second after the mouse exits. This delay allows the user to quickly pass
     * from one part of the Space Frame to another without deactivating during
     * short spans outside of the widget.
     */
    async function delayedSetSpaceFrameInactive() {
        await sleep(1000)
        if (borderHovered === false) spaceFrameActive = false
    }
</script>


<!-- Space frame. -->
<div
    class="space-frame"
    style={ spaceFrameActive ? "" : "visibility: hidden;" }
    bind:clientWidth={borderWidth} bind:clientHeight={borderHeight}
>

    <svg>

        <!-- Border(s). -->
        <g class="borders">
            {#if shape === "rectangle"}
                <rect
                    class="inner-border"
                    x={borderThickness / 2 - 50} y={borderThickness / 2 - 50} width={2 * (borderCenterX + 50) - borderThickness} height={2 * (borderCenterY + 50) - borderThickness} rx=75
                    style="stroke-width: {borderThickness + 100}px;"
                    on:mouseenter={() => {
                        borderHovered = true
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mousemove={() => {
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:touchmove={() => {
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mouseleave={() => {
                        borderHovered = false
                        delayedSetSpaceFrameInactive()
                    }}
                />
            {:else}
                <circle
                    class="outer-border"
                    cx={borderCenterX} cy={borderCenterY} r={borderRadius + 1000}
                />
                <circle
                    class="inner-border"
                    cx={borderCenterX} cy={borderCenterY} r={borderRadius}
                    style="stroke-width: {borderThickness}px;"
                    on:mouseenter={() => {
                        borderHovered = true
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mousemove={() => {
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mouseleave={() => {
                        borderHovered = false
                        delayedSetSpaceFrameInactive()
                    }}
                />
            {/if}
        </g>
        
        <!-- Direction arrows. -->
        <g
            class="arrows"
            style="
                transform-origin: {borderCenterX}px {borderCenterY}px;
                transform: scale({widthToHeightRatio}, 1);
            "
        >
            {#each arrowInfos as arrowInfo}
                <path
                    class="arrow"
                    d="
                        M {borderCenterX - 5} {borderCenterY - 50}
                        l 10 0
                        l 25 {-((borderHeight ? borderHeight : 0) * 0.25)}
                        l 25 0
                        l -55 -100
                        l -55 100
                        l 25 0
                    "
                    style="
                        transform-origin: {borderCenterX}px {borderCenterY}px;
                        transform: rotate({arrowInfo.rotation}deg);
                        { spaceFrameActive ? "pointer-events: all;" : "" }
                        stroke: {arrowInfo.color};
                        fill: {arrowInfo.color};
                    "
                    on:mouseenter={() => {
                        borderHovered = true
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mousemove={() => {
                        setSpaceFrameActiveIfSlow()
                    }}
                    on:mouseleave={() => {
                        borderHovered = false
                        delayedSetSpaceFrameInactive()
                    }}
                />
            {/each}
        </g>

    </svg>

    <!-- Direction widgets. -->
    {#each arrowInfos as arrowInfo}
        <div
            class="direction-widget-container"
            style="
                left: {borderCenterX + ((borderHeight ? borderHeight : 0) * 0.275) * widthToHeightRatio * arrowInfo.directionSigns[0]}px;
                top: {borderCenterY + ((borderHeight ? borderHeight : 0) * 0.275) * arrowInfo.directionSigns[1]}px;
            "
            on:mouseenter={() => {
                borderHovered = true
                setSpaceFrameActiveIfSlow()
            }}
            on:mousemove={() => {
                setSpaceFrameActiveIfSlow()
            }}
            on:mouseleave={() => {
                borderHovered = false
                delayedSetSpaceFrameInactive()
            }}
        >
            {#if spaceFrameActive}
                <DirectionDropdownWidget
                    startingDirection={arrowInfo.direction}
                    halfAxisId={arrowInfo.halfAxisId}
                    {graphWidgetStyle}
                    optionClickedFunction={(direction, _, option) => {
                        console.log(direction, option)

                    }}
                    optionHoveredFunction={async (_, option) => {
                        if (currentSpace) {
                            const newSpace = alteredSpace(currentSpace, option, arrowInfo.halfAxisId)
                            graph.startingSpace = newSpace
                            await graph.build()
                            addGraphIdsNeedingViewerRefresh(graph.id)
                        }
                    }}
                    exitOptionHoveredFunction={async () => {
                        graph.startingSpace = originalSpace
                        await graph.build()
                        addGraphIdsNeedingViewerRefresh(graph.id)
                    }}
                />
            {/if}
        </div>
    {/each}
</div>


<style>
    .space-frame {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);

        pointer-events: none;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }

    .borders {
        fill: transparent;
    }

    .outer-border {
        stroke-width: 2000px;
        stroke: grey;
    }

    .inner-border {
        stroke: dimgrey;

        pointer-events: stroke;
        cursor: pointer;
    }

    .arrow {
        opacity: 0.25;

        cursor: pointer;
    }

    .arrow:hover {
        opacity: 0.5;
    }

    .direction-widget-container {
        position: absolute;
        transform: translate(-50%, -50%);
    }
  </style>