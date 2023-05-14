<script>
    import { sineIn } from "svelte/easing";

    export let scale = 1
    export let outlineColor = "black"
    export let backgroundColor = "whitesmoke"
    export let imageColor = "dimgrey"

    
    const iconSize = 100 * scale

    const width = 100
    const height = 100
    const centerX = width / 2
    const centerY = height / 2

    const smallCirclePercentOffsetFromCenter = 0.25
    const smallCircleOffsetFromCenter = smallCirclePercentOffsetFromCenter * width
    const smallCircleAngle = 30
    const smallCircleOffsetFromCenterX = smallCircleOffsetFromCenter * Math.cos(smallCircleAngle * (Math.PI / 180))
    const smallCircleOffsetFromCenterY = smallCircleOffsetFromCenter * Math.sin(smallCircleAngle * (Math.PI / 180))
    const smallCircleWidth = 7

    const bottomLeftCircleCenterX = centerX - smallCircleOffsetFromCenterX + 2
    const bottomLeftCircleCenterY = centerY + smallCircleOffsetFromCenterY + 5
    const topRightCircleCenterX = centerX + smallCircleOffsetFromCenterX + 2
    const topRightCircleCenterY = centerY - smallCircleOffsetFromCenterY + 5
    
    const hookEndOffsetFromTarget = 17
    const hookEndAngle = 30
    const hookEndOffsetFromTargetX = hookEndOffsetFromTarget * Math.cos(hookEndAngle * (Math.PI / 180))
    const hookEndOffsetFromTargetY = hookEndOffsetFromTarget * Math.sin(hookEndAngle * (Math.PI / 180))

    const hookEndCenterX = topRightCircleCenterX - hookEndOffsetFromTargetX
    const hookEndCenterY = topRightCircleCenterY - hookEndOffsetFromTargetY
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
            stroke-width=7
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

            <!-- Hook line. -->
            <line
                x1={bottomLeftCircleCenterX} y1={bottomLeftCircleCenterY}
                x2={hookEndCenterX} y2={hookEndCenterY}
                stroke={outlineColor}
            />

            <!-- Hook end. -->
            <path
                d="
                    M {hookEndCenterX - 1} {hookEndCenterY + 3}
                    A {smallCircleWidth + 1} {smallCircleWidth + 1} 180 1 1 {hookEndCenterX + 10} {hookEndCenterY - 6}
                "
                stroke={outlineColor}
            />

            <!-- Lower-left circle. -->
            <circle
                class="small-circle"
                cx={bottomLeftCircleCenterX}
                cy={bottomLeftCircleCenterY}
                r={smallCircleWidth}
                fill={backgroundColor}
                stroke={outlineColor}
            />

            <!-- Upper-right circle. -->
            <circle
                class="small-circle"
                cx={topRightCircleCenterX}
                cy={topRightCircleCenterY}
                r={smallCircleWidth}
                fill={backgroundColor}
                stroke={outlineColor}
            />

            <!-- Outline. -->
            <circle
                cx={centerX}
                cy={centerY}
                r=50
                stroke={outlineColor}
                stroke-width=10
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