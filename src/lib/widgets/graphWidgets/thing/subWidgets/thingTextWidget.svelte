<script lang="ts">
    import { titleFontWeightStore } from "$lib/stores";
    import { TextFittingDiv } from "$lib/widgets/layoutWidgets"


    export let thingWidth: number
    export let thingHeight: number
    export let sidewaysText: boolean
    export let isEncapsulating: boolean
    export let showContent: boolean
    export let fontSize: number
    export let text: string
</script>


<div
    class="text-container"
    class:horizontal={!sidewaysText}
    class:sideways={sidewaysText}

    style="width: {thingWidth}px; height: {thingHeight}px;"
>
    <div
        class="thing-text"
        class:encapsulating={isEncapsulating}
        class:show-content={showContent}
        class:hide-content={!showContent}
        
        style="
            font-size: {fontSize}px;
        "
    >
        <TextFittingDiv
            {text}
            defaultFontSize={fontSize}
            defaultFontWeight={$titleFontWeightStore ?? 600}
        />
    </div>
</div>


<style>
    .text-container {
        box-sizing: border-box;

        position: relative;
        
        text-align: center;
        
        pointer-events: none;
    }

    .text-container.sideways {
        transform: rotate(-90deg);
    }

    .thing-text {
        position: relative;
        left: 5%;
        top: 5%;
        width: 90%;
        height: 90%;
    }

    .thing-text.encapsulating {
        position: absolute;
        transform: translate(0%, -50%);

        white-space: nowrap;
    }

    .thing-text.show-content {
        text-align: center;
    }

    .thing-text.hide-content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
</style>