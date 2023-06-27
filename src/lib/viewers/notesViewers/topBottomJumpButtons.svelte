<script lang="ts">
    export let scrollableDiv: Element
    export let scrollableDivScrollTop: number


    $: topThreshold = scrollableDiv?.clientHeight || 0
    $: bottomThreshold = scrollableDiv ? scrollableDiv.scrollHeight - 2 * scrollableDiv.clientHeight : 0
    $: scrollPosition = 
        scrollableDiv && scrollableDiv.scrollHeight > scrollableDiv.clientHeight ? scrollableDivScrollTop :
        null
    $: showTopButton = scrollPosition !== null && scrollPosition > topThreshold
    $: showBottomButton = scrollPosition !== null && scrollPosition < bottomThreshold
</script>


{#if showTopButton}
    <!-- Jump-to-top button. -->
    <div
        class="jump-to-top-button"

        style="
            top: 10px;
            transform: translate(-50%, 0) rotate(-90deg);
        "

        on:click|stopPropagation={() => {scrollableDiv.scrollTo({top: 0, behavior: "smooth"})}}
        on:keydown={()=>{}}
        on:dblclick|stopPropagation|preventDefault
    >
        »
    </div>
{/if}

{#if showBottomButton}
    <!-- Jump-to-bottom button. -->
    <div
        class="jump-to-bottom-button"

        style="
            bottom: 10px;
            transform: translate(-50%, 0) rotate(90deg);
        "

        on:click|stopPropagation={() => {scrollableDiv.scrollTo({top: scrollableDiv.scrollHeight, behavior: "smooth"})}}
        on:keydown={()=>{}}
        on:dblclick|stopPropagation|preventDefault
    >
        »
    </div>
{/if}


<style>
    .jump-to-top-button, .jump-to-bottom-button {
        border-radius: 5px;
        box-shadow: 0px 0px 3px 1px gainsboro;

        position: absolute;
        left: 50%;
        width: 23px;
        height: 25px;
        z-index: 1;
        background-color: white;
        opacity: 50%;

        text-align: center;
        line-height: 18px;
        font-size: 34px;
        color: silver;

        cursor: pointer;
    }

    .jump-to-top-button:hover, .jump-to-bottom-button:hover {
        background-color: whitesmoke;
        opacity: 1;
    }

    .jump-to-top-button:active, .jump-to-bottom-button:active {
        background-color: #e8e8e8;
    }
</style>