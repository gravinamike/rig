<script lang="ts">
    import { disableRelationshipBeingCreated, remoteRelatingInfoStore, disableRemoteRelating } from "$lib/stores"

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    function cancel() {
        disableRelationshipBeingCreated()
        disableRemoteRelating()
    }
</script>


<svelte:body
    on:keyup={handleEscape}
/>


{#if $remoteRelatingInfoStore.sourceWidgetModel }
    <div
        class="disabled-background"
        style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click={cancel}
        on:wheel|preventDefault
    />

    <div class="remote-relating-widget">
        REMOTE RELATING WIDGET
    </div>
{/if}


<style>
    .remote-relating-widget {
        border-radius: 20px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        box-sizing: border-box;
        width: calc(100% - 200px);
        height: calc(100% - 200px);
        background-color: #fafafa;

        padding: 20px;
    }
</style>