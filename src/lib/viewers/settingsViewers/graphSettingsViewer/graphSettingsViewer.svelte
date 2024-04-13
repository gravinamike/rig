<script lang="ts">
    // Import types.
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"

    // Import basic framework resources.
    import { onMobile } from "$lib/shared/utility"

    // Import stores and store-related methods.
    import {
        uIBackgroundColorStore, uITrimColorStore, mobileMenuTrimColorStore,
        landscapeOrientation, readOnlyMode as readOnlyModeStore, addGraphIdsNeedingViewerRefresh
    } from "$lib/stores"
    
    // Import associated widgets.
    import SettingWidget from "./settingWidget.svelte"

    // Import API methods.
    import { saveGraphConfig } from "$lib/shared/config"
    

    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle


    // Proxy flag for read-only mode.
    let readOnlyMode = false
    $: readOnlyMode = $readOnlyModeStore


    /**
     * Update-read-only-mode method.
     * 
     * Sets the read-only-mode store and configuration option based on the
     * current value of the proxy flag in this component.
     */
    async function updateReadOnlyMode() {
        readOnlyModeStore.set(readOnlyMode)
        await saveGraphConfig()
    }

    /**
     * Update-Graph-format method.
     * 
     * Used to refresh the Graph after one of the settings has changed.
     */
    function updateGraphFormat() {
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
</script>


<!-- Graph settings viewer. -->
<div
    class="graph-settings-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {
        onMobile() && !$landscapeOrientation ? $mobileMenuTrimColorStore :
        $uITrimColorStore
    };"
>
    <!-- Viewer content. -->
    <div
        class="content"

        style="background-color: {$uIBackgroundColorStore};"
    >
        <!-- Title. -->
        <h4>Graph settings</h4>

        <!-- Setting widgets. -->
        <div class="setting-widgets">
            <!-- Read-only mode. -->
            <SettingWidget
                labelText={"Read-only mode"}
                bind:boundValue={readOnlyMode}
                tooltipText={"Disables editing the Graph."}
                onChangeFunction={updateReadOnlyMode}
            />

            <!-- Zoom level. -->
            <SettingWidget
                labelText={"Zoom"}
                bind:boundValue={graphWidgetStyle.zoom}
                minValue={-5}
                maxValue={5}
                tooltipText={"Zooms the view in and out."}
            />

            <!-- Relation offset length. -->
            <SettingWidget
                labelText={"Relation offset length"}
                bind:boundValue={graphWidgetStyle.relationDistance}
                maxValue={1000}
                tooltipText={"Distance between related Things."}
                onChangeFunction={updateGraphFormat}
            />

            <!-- Thing size. -->
            <SettingWidget
                labelText={"Thing size"}
                bind:boundValue={graphWidgetStyle.thingSize}
                maxValue={1000}
                tooltipText={"Size of a single Thing."}
                onChangeFunction={updateGraphFormat}
            />

            <!-- Percent Thing spacing. -->
            <SettingWidget
                labelText={"% Thing spacing"}
                bind:boundValue={graphWidgetStyle.thingSpacingPercent}
                minValue={-100}
                maxValue={100}
                tooltipText={"Distance between sibling Things."}
                onChangeFunction={updateGraphFormat}
            />

            <!-- Relationship text size. -->
            <SettingWidget
                labelText={"Relationship text size"}
                bind:boundValue={graphWidgetStyle.relationshipTextSize}
                maxValue={100}
                tooltipText={"Size of Relationship text."}
                onChangeFunction={updateGraphFormat}
            />

            <!-- Thing text size. -->
            <SettingWidget
                labelText={"Thing text size"}
                bind:boundValue={graphWidgetStyle.thingTextSize}
                maxValue={100}
                tooltipText={"Size of Thing text."}
                onChangeFunction={updateGraphFormat}
            />
        </div>
    </div>
</div>


<style>
    .graph-settings-viewer {        
        box-sizing: border-box;
        height: calc(100% - 43px);

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        
        text-align: center;
    }

    .graph-settings-viewer.on-mobile {        
        font-size: 0.9rem;
    }

    .content {
        border-radius: 5px;

        height: 100%;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 2rem;
    }

    .graph-settings-viewer.on-mobile .content {   
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;     
        gap: 1.5rem;
    }

    h4 {
        margin: 0;
    }

    .setting-widgets {
        flex: 1 1 0;

        display: flex;
        flex-direction: column;
        gap: 1rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }
  </style>