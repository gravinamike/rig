<script lang="ts">
    import type { HalfAxisId } from "$lib/shared/constants"
    import type { Space } from "$lib/models/graphModels"
    import type { GraphWidgetModel } from "$lib/models/widgetModels";

    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    import { sleep } from "$lib/shared/utility"
    import { copiedSpace, alteredSpace } from "$lib/models/graphModels"
    import { DirectionWidget } from "$lib/widgets/graphWidgets"
    import { addGraphIdsNeedingViewerRefresh } from "$lib/stores"

    export let graphWidgetModel: GraphWidgetModel
    export let currentSpace: Space | null


    let originalSpace: Space | null
    let originalSpaceSet = false
    $: if (currentSpace !== null && !originalSpaceSet) {
        originalSpace = copiedSpace(currentSpace)
        originalSpaceSet = true
    }

    const shape: "rectangle" | "circle" = "rectangle"
    const borderThickness = 20

    let borderWidth: number | undefined
    let borderHeight: number | undefined
    $: borderCenterX = borderWidth ? borderWidth / 2 : 0
    $: borderCenterY = borderHeight ? borderHeight / 2 : 0
    $: borderRadius = Math.min(borderCenterX, borderCenterY)
    $: widthToHeightRatio = borderWidth && borderHeight ? borderWidth / borderHeight : 0

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

    let borderHovered = false
    let lastBorderHoveredChangeSignal = false
    
    async function delayedSetBorderHovered(hovered: boolean, delay: number) {
        lastBorderHoveredChangeSignal = hovered
        if (hovered) {
            borderHovered = true
        } else {
            await sleep(delay)
            if (!lastBorderHoveredChangeSignal) borderHovered = false
        }
    }
</script>


<!-- Space frame. -->
<div
    class="space-frame"
    style={ borderHovered ? "" : "visibility: hidden;" }
    bind:clientWidth={borderWidth} bind:clientHeight={borderHeight}
>
    <svg>
        <g class="borders">
            {#if shape === "rectangle"}
                <rect
                    class="inner-border"
                    x={borderThickness / 2 - 50} y={borderThickness / 2 - 50} width={2 * (borderCenterX + 50) - borderThickness} height={2 * (borderCenterY + 50) - borderThickness} rx=75
                    style="stroke-width: {borderThickness + 100}px;"
                    on:mouseenter={() => {delayedSetBorderHovered(true, 0)}}
                    on:mouseleave={() => {delayedSetBorderHovered(false, 1000)}}
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
                    on:mouseenter={() => {delayedSetBorderHovered(true, 0)}}
                    on:mouseleave={() => {delayedSetBorderHovered(false, 1000)}}
                />
            {/if}
        </g>
        
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
                        { borderHovered ? "pointer-events: all;" : "" }
                        stroke: {arrowInfo.color};
                        fill: {arrowInfo.color};
                    "
                    on:mouseenter={() => {delayedSetBorderHovered(true, 0)}}
                    on:mouseleave={() => {delayedSetBorderHovered(false, 1000)}}
                />
            {/each}
        </g>
    </svg>

    {#each arrowInfos as arrowInfo}
        <div
            class="direction-widget-container"
            style="
                left: {borderCenterX + ((borderHeight ? borderHeight : 0) * 0.275) * widthToHeightRatio * arrowInfo.directionSigns[0]}px;
                top: {borderCenterY + ((borderHeight ? borderHeight : 0) * 0.275) * arrowInfo.directionSigns[1]}px;
            "
            on:mouseenter={() => {delayedSetBorderHovered(true, 0)}}
            on:mouseleave={() => {delayedSetBorderHovered(false, 750)}}
        >
            {#if borderHovered}
                <DirectionWidget
                    direction={arrowInfo.direction}
                    halfAxisId={arrowInfo.halfAxisId}
                    {graphWidgetModel}
                    optionClickedFunction={(direction, _, option) => {
                        console.log(direction, option)

                    }}
                    optionHoveredFunction={async (_, option) => {
                        if (currentSpace) {
                            const newSpace = alteredSpace(currentSpace, option, arrowInfo.halfAxisId)
                            graphWidgetModel.graph.startingSpace = newSpace
                            await graphWidgetModel.graph.build()
                            addGraphIdsNeedingViewerRefresh(graphWidgetModel.graph.id)
                        }
                    }}
                    exitOptionHoveredFunction={async () => {
                        graphWidgetModel.graph.startingSpace = originalSpace
                        await graphWidgetModel.graph.build()
                        addGraphIdsNeedingViewerRefresh(graphWidgetModel.graph.id)
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