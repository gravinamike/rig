<script lang="ts">
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"
    import {
        setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated, remoteRelatingInfoStore, disableRemoteRelating, relationshipBeingCreatedInfoStore
    } from "$lib/stores"
    import { RemoteSelectingWidget } from "$lib/widgets/dialogWidgets"
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets";


    let graph: Graph | null = null

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    function cancel() {
        disableRelationshipBeingCreated()
        disableRemoteRelating()
    }

    function submitMethod(selectedItem: SearchOption | null, matchedItems: SearchOption[]) {
        const destThingId = (
            selectedItem ? selectedItem.id :
            matchedItems.length ? matchedItems[0].id :
            null
        )

        const relatableForCurrentDrag =
            (
                // There is a drag-relate in progress,
                $remoteRelatingInfoStore.sourceThingId
                // and the source of the drag is not *this* Thing.
                && $remoteRelatingInfoStore.sourceThingId !== destThingId
            ) ? true :
            false

        if (
            destThingId
            && relatableForCurrentDrag
            && graph?.rootCohort?.members[0]
        ) {
            setRelationshipBeingCreatedDestThingId(
                graph.rootCohort.members[0].thingId
            )
        }
    }
</script>


<svelte:body
    on:keyup={handleEscape}
/>


{#if graph && $remoteRelatingInfoStore.sourceThingId && !$relationshipBeingCreatedInfoStore.destThingId}
    <div
        class="disabled-background"
        style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 1; background-color: grey; opacity: 0.5;"
        on:click|stopPropagation={cancel}
        on:wheel|preventDefault
    />

    <div
        class="remote-relating-widget"
        on:click|stopPropagation
    >
        <RemoteSelectingWidget
            {submitMethod}
        /> 
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

        display: flex;
        flex-direction: row;
        padding: 20px;
    }
</style>