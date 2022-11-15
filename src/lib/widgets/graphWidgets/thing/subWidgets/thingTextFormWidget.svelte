<script lang="ts">
    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"

    export let id: string
    export let text: string
    export let perspectiveText: string
    export let usePerspectiveText: boolean
    export let submit: () => void
    export let cancel: () => void
</script>


<div
    class="thing-form-text-widget"
    
    on:keypress={(event) => {
        if (event.key === "Enter") submit()
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
            placeholder="Enter text"

            on:mousemove|stopPropagation
        />
    {:else}
        <textarea
            id={id}
            bind:value={text}
            
            class="text-input"
            rows=3
            placeholder="Enter Perspective text"

            on:mousemove|stopPropagation
        />
    {/if}
</div>



<style>
    .thing-form-text-widget {
        position: relative;
        z-index: 1;

        padding: 1rem;
    }

    .cancel-button-container {
        position: absolute;
        top: 2px;
        right: 2px;
    }

    textarea {
        outline: none;
        border: solid 1px lightgrey;

        width: 100% !important;

        font-family: Arial;
        font-size: 10px;   

        resize: none;
    }

    textarea:focus {
        border: solid 1px grey;
    }
</style>