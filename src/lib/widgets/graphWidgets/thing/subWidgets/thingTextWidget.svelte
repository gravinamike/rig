<script lang="ts">
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
        
        style="font-size: {fontSize}px;"
    >
        {text}
    </div>
</div>


<style>
    .text-container {
        left: 0;
        
        text-align: center;
    }

    .text-container.sideways {
        transform: rotate(-90deg);
    }

    .thing-text {
        font-weight: 600;
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
        
        overflow-wrap: break-word;
    }
</style>