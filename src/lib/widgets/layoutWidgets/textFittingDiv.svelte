<script lang="ts">
    // Import SvelteKit framework resources.
    import { onMount, tick } from "svelte"



    export let text: string
    export let defaultFontSize: number = 20


    
    // HTML element handles.
    let textFittingDiv: Element | null = null
    let textFittingDivWidth = 1
    let textFittingDivHeight = 1


    // Font-size-related variables.
    let fontSize = defaultFontSize
    const minFontSize = 8

    /**
     * Fit-text-to-div method.
     * 
     * If the text overflows the div, progressively shrinks the text until it fits (or hits the
     * minimum font size).
     */
    async function fitTextToDiv() {
        // If the component hasn't been rendered yet, abort.
        if (!textFittingDiv) return

        // Set the font size to its default value to start.
        fontSize = defaultFontSize

        // Determine if the text is overflowing the div.
        let isOverFlowing = (
            textFittingDiv.scrollWidth > textFittingDiv.clientWidth
            || textFittingDiv.scrollHeight > textFittingDiv.clientHeight
        )

        // As long as the text is overflowing the div, make it smaller and re-determine whether it
        // is still overflowing.
        while (isOverFlowing && fontSize > minFontSize) {
            fontSize--
            await tick()
            isOverFlowing = (
                textFittingDiv.scrollWidth > textFittingDiv.clientWidth
                || textFittingDiv.scrollHeight > textFittingDiv.clientHeight
            )
        }
    }

    // Rerun the fit-text-to-div method whenever the div's dimensions, the text, or the default
    // font size change.
    $: {
        textFittingDivWidth
        textFittingDivHeight
        text
        defaultFontSize
        
        fitTextToDiv()
    }


    // When the component is first rendered, fit the text to the div.
    onMount(async () => {
        fitTextToDiv()
    })    
</script>


<!-- Text-fitting-div. -->
<div
    class="text-fitting-div"

    style="font-size: {fontSize}px;"

    bind:this={textFittingDiv}
    bind:clientWidth={textFittingDivWidth}
    bind:clientHeight={textFittingDivHeight}
>
    {text}
</div>


<style>
    .text-fitting-div {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;

        overflow-wrap: normal;
    }
</style>