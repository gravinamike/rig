<script lang="ts">
    const shape: "rectangle" | "circle" = "rectangle"
    const borderThickness = 20

    let borderWidth: number
    let borderHeight: number
    $: borderCenterX = borderWidth / 2
    $: borderCenterY = borderHeight / 2
    $: borderRadius = Math.min(borderCenterX, borderCenterY)

    let borderHovered = false
</script>


<!-- Space frame. -->
<div
    class="space-frame"
    style={ borderHovered ? "" : "visibility: hidden;" }
    bind:clientWidth={borderWidth} bind:clientHeight={borderHeight}
>
    <svg>
        {#if shape === "rectangle"}
            <rect
                class="inner-border"
                x={borderThickness / 2 - 50} y={borderThickness / 2 - 50} width={2 * (borderCenterX + 50) - borderThickness} height={2 * (borderCenterY + 50) - borderThickness} rx=75
                style="stroke-width: {borderThickness + 100}px;"
                on:mouseenter={() => {borderHovered = true}}
                on:mouseleave={() => {borderHovered = false}}
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
                on:mouseenter={() => {borderHovered = true}}
                on:mouseleave={() => {borderHovered = false}}
            />
        {/if}
    </svg>
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
  </style>