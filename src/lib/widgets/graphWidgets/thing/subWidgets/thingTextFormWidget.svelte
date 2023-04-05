<script lang="ts">
    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"

    export let id: string
    export let text: string
    export let perspectiveText: string
    export let usePerspectiveText: boolean
    export let fontSize: number
    export let submit: () => void
    export let cancel: () => void
</script>


<div
    class="thing-text-form-widget"
    
    on:keypress={(event) => {
        if (event.key === "Enter") {
            event.preventDefault() // Prevent carriage-return from being included in entered text.
            submit()
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
    }

    .cancel-button-container {
        position: absolute;
        top: 2px;
        right: 2px;
    }

    textarea {
        outline: none;
        border: solid 1px lightgrey;

        width: 75% !important;
        height: 75%;

        font-family: Arial;

        resize: none;
    }

    textarea:focus {
        border: solid 1px grey;
    }
</style>