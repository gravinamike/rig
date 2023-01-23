<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { SearchOption } from "$lib/widgets/navWidgets/searchWidget"

    // Import stores.
    import {
        remoteRelatingInfoStore, disableRemoteRelating,
        relationshipBeingCreatedInfoStore, setRelationshipBeingCreatedDestThingId, disableRelationshipBeingCreated,
    } from "$lib/stores"

    // Import related widgets.
    import { RemoteSelectingWidget } from "$lib/widgets/dialogWidgets"


    // The Graph of the remote-selecting widget.
    let graph: Graph | null = null

    /**
     * Handle-escape method.
     * When the escape key is pressed, calls the cancel method.
     */
    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") cancel()
    }

    /**
     * Cancel method.
     * Disables both the remote-relating widget and any Relationship-being-
     * created widget that is active.
     */
    function cancel() {
        disableRelationshipBeingCreated()
        disableRemoteRelating()
    }

    /**
     * Submit method.
     * If conditions are correct for specifying the destination Thing for the
     * remote-relating operation, calls `setRelationshipBeingCreatedDestThingId`.
     */
    function submitMethod( selectedItem: SearchOption | null, matchedItems: SearchOption[] ) {
        // The ID of the destination Thing is...
        const destThingId =
            // ...the ID of the selected dropdown menu item if one has been
            // selected...
            selectedItem ? selectedItem.id :
            // ...or, the ID of the first match to what's been entered into the
            // search menu so far, if there are any matches...
            matchedItems.length ? matchedItems[0].id :
            //...or, otherwise, null.
            null

        // The destination Thing is a valid relating target if...
        const relatableForCurrentDrag =
            (
                // ...there is a drag-relate in progress...
                $remoteRelatingInfoStore.sourceThingId
                // ...and the source of the drag is not the target Thing.
                && $remoteRelatingInfoStore.sourceThingId !== destThingId
            ) ? true :
            false

        // If there is a valid destination Thing ID and the Graph currently has a
        // root Thing,
        if (
            destThingId
            && relatableForCurrentDrag
            && graph?.rootCohort?.members[0]
        ) {
            // Set the destination Thing ID in the store to the root Thing's ID.
            setRelationshipBeingCreatedDestThingId(
                graph.rootCohort.members[0].thingId
            )
        }
    }
</script>


<!-- Set an escape-key-release anywhere on the page to trigger the appropriate handler. -->
<svelte:body
    on:keyup={handleEscape}
/>


<!-- The remote-relating widget is visible if the store specifies a source Thing, but no destination Thing yet. -->
{#if $remoteRelatingInfoStore.sourceThingId && !$relationshipBeingCreatedInfoStore.destThingId}
    <div
        class="disabled-background"
        on:click|stopPropagation={cancel}
        on:wheel|preventDefault
        on:keydown={()=>{}}
    />

    <div
        class="remote-relating-widget"
        on:click|stopPropagation
        on:keydown={()=>{}}
    >
        <!-- Remote-Thing-selecting widget. -->
        <RemoteSelectingWidget
            {submitMethod}
            bind:graph
        /> 
    </div>
{/if}


<style>
    .disabled-background {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        z-index: 2;
        background-color: grey;
        opacity: 0.5;
    }

    .remote-relating-widget {
        border-radius: 20px;
        outline: solid 1px grey;
        outline-offset: -1px;
        box-shadow: 0 0 20px 10px whitesmoke;

        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        box-sizing: border-box;
        width: calc(100% - 200px);
        height: calc(100% - 200px);
        background-color: #fafafa;

        display: flex;
        flex-direction: row;
        padding: 20px;
    }
</style>