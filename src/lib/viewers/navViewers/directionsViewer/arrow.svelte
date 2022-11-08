<script lang="ts">
    export let svgLength: number
    export let svgHeight: number
    export let color: string
    export let reversed = false

    $: arrowThickness = svgHeight * 0.6
    $: arrowMidline = svgHeight / 2

    $: triangleLength = svgHeight * 0.75
    $: triangleBase = svgLength - triangleLength
    $: trianglePoint = svgLength
    const triangleTop = 0
    $: triangleBottom = svgHeight
</script>


<svg
    width={svgLength}
    height={svgHeight}
    style="transform: scaleX({reversed ? -1 : 1})"
>
    <g
        class="arrow"
        style="
            stroke: {color};
            fill: {color};
        "
    >
        <line
            x1=0 y1={arrowMidline}
            x2={triangleBase + 1} y2={arrowMidline}
            style="stroke-width: {arrowThickness};"
        />
        <polygon
            points="
                {triangleBase}, {triangleTop}
                {triangleBase}, {triangleBottom}
                {trianglePoint}, {arrowMidline}
            "
        />
    </g>
</svg>


<style>
    .arrow {
        opacity: 0.10;
    }

    polygon {
        stroke-width: 0
    }
</style>