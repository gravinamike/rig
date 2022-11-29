<script lang="ts">
    import { XButton, ConfirmDeleteBox } from "$lib/widgets/layoutWidgets"

    export let showDeleteButton: boolean
    export let confirmDeleteBoxOpen: boolean
    export let thingWidth: number
    export let thingHeight: number
    export let encapsulatingDepth: number
    export let elongationCategory: "vertical" | "horizontal" | "neutral"
    export let startDelete: () => void
    export let completeDelete: () => void
</script>


{#if showDeleteButton}

    <div class="delete-button-container">
        <XButton
            buttonFunction={startDelete}
        />
    </div>

{/if}

{#if confirmDeleteBoxOpen}

    <ConfirmDeleteBox
        {thingWidth}
        {thingHeight}
        {encapsulatingDepth}
        {elongationCategory}
        confirmDeleteFunction={completeDelete}
    />

{/if}


<style>
    .delete-button-container {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 1;
    }
</style>