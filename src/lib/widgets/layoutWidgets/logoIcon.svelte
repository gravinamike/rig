<script>
    export let scale = 1
    export let outlineColor = "black"
    export let backgroundColor = "whitesmoke"
    export let imageColor = "dimgrey"

    
    const iconSize = 100 * scale

    const width = 100
    const height = 100
    const centerX = width / 2
    const centerY = height / 2

    const boxPeak = centerY - 3
    const boxTop = centerY + 3
    const boxBottom = centerY + 30
    const boxLeft = centerX - 23
    const boxRight = centerX + 23

    const roofPeak = boxPeak - 10
    const roofTop = boxTop - 3
    const roofLeft = boxLeft - 5
    const roofRight = boxRight + 5

    const archTop = boxTop
    const archBottom = boxBottom - 6
    const archMiddle = (boxTop + boxBottom) / 2
    const arch1Left = boxLeft + 6
    const arch1Right = centerX - 6
    const arch2Left = centerX + 6
    const arch2Right = boxRight - 6

    const poleTop = centerY - 43
    const arrowHeight = centerY - 30
    const arrowLeft = centerX - 18
    const arrowRight = centerX + 18
</script>


<div
    class="logo-icon"

    style="width: {iconSize}px; height: {iconSize}px;"
>
    <div
        class="scale-container"

        style="
            left: {iconSize / 2}px;
            top: {iconSize / 2}px;
            transform: translate(-50%, -50%) scale({scale});
        "
    >
        <svg
            stroke-width=5
            stroke={imageColor}
            fill="none"
        >
            <!-- Background. -->
            <circle
                class="background"
                cx={centerX}
                cy={centerY}
                r={centerX}
                fill={backgroundColor}
            />

            <!-- Box. -->
            <polygon
                points="
                    {boxLeft},{boxTop}
                    {centerX},{boxPeak}
                    {boxRight},{boxTop}
                    {boxRight},{boxBottom}
                    {boxLeft},{boxBottom}
                "
            />

            <!-- Roof. -->
            <path
                d="
                    M {boxLeft} {boxTop}
                    L {roofLeft} {boxTop}, {roofLeft} {roofTop}, {centerX} {roofPeak},
                    {roofRight} {roofTop}, {roofRight} {boxTop}, {boxRight} {boxTop},
                    {centerX} {boxPeak}, Z
                "
                fill={imageColor}
            />

            <!-- Left window arch. -->
            <path
                d="
                    M {arch1Left} {archBottom} L {arch1Left} {archMiddle}
                    C {arch1Left} {archTop}, {arch1Right} {archTop}, {arch1Right} {archMiddle - 3}
                    L {arch1Right} {archBottom} Z
                "
                stroke-width=3
                fill={imageColor}
            />

            <!-- Right window arch. -->
            <path
                d="
                    M {arch2Left} {archBottom} L {arch2Left} {archMiddle - 3}
                    C {arch2Left} {archTop}, {arch2Right} {archTop}, {arch2Right} {archMiddle}
                    L {arch2Right} {archBottom} Z
                "
                stroke-width=3
                fill={imageColor}
            />

            <!-- Centerline. -->
            <line
                x1={centerX} y1={poleTop}
                x2={centerX} y2={height}
            />

            <!-- Arrow shaft.-->
            <line
                x1={arrowLeft} y1={arrowHeight}
                x2={arrowRight} y2={arrowHeight}
            />

            <!-- Arrow tail.-->
            <polygon
                points="
                    {arrowLeft + 3},{arrowHeight}
                    {arrowLeft - 3},{arrowHeight - 3}
                    {arrowLeft - 3},{arrowHeight + 3}
                "
            />

            <!-- Arrow head.-->
            <polygon
                points="
                    {arrowRight + 3},{arrowHeight}
                    {arrowRight - 3},{arrowHeight - 3}
                    {arrowRight - 3},{arrowHeight + 3}
                "
            />

            <!-- Roof underneath -->
            <polygon
                points="
                    {0},{height}
                    {0},{height - 10}
                    {boxLeft},{boxBottom}
                    {boxRight},{boxBottom}
                    {width},{height - 10}
                    {width},{height}
                    {0},{height}
                "
                fill={imageColor}
            />

            <!-- Ball. -->
            <circle
                cx={centerX}
                cy={roofPeak - 6}
                r=3
            />

            <!-- Outline. -->
            <circle
                cx={centerX}
                cy={centerY}
                r=50
                stroke={outlineColor}
            />
        </svg>
    </div>
</div>


<style>
    .logo-icon {
        position: relative;

        pointer-events: none;
    }

    .scale-container {
        border-radius: 50px;

        position: absolute;
        width: 100px;
        height: 100px;

        overflow: hidden;
    }

    .background {
        stroke: none;
    }
</style>