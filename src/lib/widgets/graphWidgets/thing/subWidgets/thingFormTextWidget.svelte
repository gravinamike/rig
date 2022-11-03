<script lang="ts">
    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"

    export let textField: HTMLTextAreaElement | null
    export let submit: () => {}
    export let cancel: () => {}
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
    <textarea
        id="thing-form-text-field"
        bind:this={textField}
        
        class="text-input"
        rows=3
        placeholder="Enter text"

        on:mousemove|stopPropagation
    />
</div>



<style>
    .thing-form-text-widget {
        width: 100%;
        height: 100%;
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