<script lang="ts">
    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"

    export let id: string
    export let text: string
    export let perspectiveText: string
    export let usePerspectiveText: boolean
    export let fontSize: number
    export let submitted: boolean
    export let submit: () => void
    export let cancel: () => void
</script>


<div
    class="thing-text-form-widget"
    
    on:keypress={(event) => {
        if (event.key === "Enter") {
            event.preventDefault() // Prevent carriage-return from being included in entered text.
            if (!submitted) submit()
        }
    }}
>
    <!-- Cancel button. -->
    <div class="cancel-button-container">
        <XButton
            buttonFunction={cancel}
        />
    </div>

    <!-- Thing text field. -->
    {#if usePerspectiveText}
        <textarea
            id={id}
            bind:value={perspectiveText}
            
            class="text-input"
            rows=3
            placeholder="Enter Perspective text"

            style="font-size: {perspectiveText && perspectiveText.length > 0 ? fontSize : 14}px;"

            on:mousemove|stopPropagation
            on:touchmove|stopPropagation
        />
    {:else}
        <textarea
            id={id}
            bind:value={text}
            
            class="text-input"
            rows=3
            placeholder="Enter text"

            style="font-size: {text && text.length > 0 ? fontSize : 14}px;"

            on:mousemove|stopPropagation
            on:touchmove|stopPropagation
        />
    {/if}
</div>



<style>
    .thing-text-form-widget {
        box-sizing: border-box;

        position: relative;
        height: 100%;
        z-index: 1;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        pointer-events: none;
    }

    .cancel-button-container {
        position: absolute;
        top: 2px;
        right: 2px;

        pointer-events: auto;
    }

    textarea {
        outline: none;
        border: solid 1px lightgrey;

        width: 75% !important;
        height: 75%;

        scrollbar-width: thin;

        font-family: Arial;

        resize: none;
        pointer-events: auto;
    }

    textarea:focus {
        border: solid 1px grey;
    }
</style>