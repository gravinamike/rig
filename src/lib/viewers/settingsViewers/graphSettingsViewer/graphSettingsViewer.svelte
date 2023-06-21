<script lang="ts">
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { addGraphIdsNeedingViewerRefresh, landscapeOrientation, mobileMenuTrimColorStore, readOnlyMode as readOnlyModeStore, uIBackgroundColorStore, uITrimColorStore } from "$lib/stores"
    import SettingWidget from "./settingWidget.svelte"
    import { saveGraphConfig } from "$lib/shared/config"
    import { onMobile } from "$lib/shared/utility";


    export let graph: Graph
    export let graphWidgetStyle: GraphWidgetStyle
    export let allowZoomAndScrollToFit: boolean


    let readOnlyMode = false
    $: readOnlyMode = $readOnlyModeStore


    async function updateReadOnlyMode() {
        readOnlyModeStore.set(readOnlyMode)
        await saveGraphConfig()
    }
    
    async function setGraphDepth() {
        await graph.generations.adjustToDepth(graph._depth)
        allowZoomAndScrollToFit = true
        addGraphIdsNeedingViewerRefresh(graph.id)
    }

    function updateGraphFormat() {
        addGraphIdsNeedingViewerRefresh(graph.id)
    }
</script>


<div
    class="graph-settings-viewer"
    class:on-mobile={onMobile()}

    style="background-color: {onMobile() && !$landscapeOrientation ? $mobileMenuTrimColorStore : $uITrimColorStore};"
>

    <div
        class="content"

        style="background-color: {$uIBackgroundColorStore};"
    >
        <h4>Graph settings</h4>

        <div class="setting-widgets">
            <SettingWidget
                labelText={"Read-only mode"}
                bind:boundValue={readOnlyMode}
                tooltipText={"Disables editing the Graph."}
                onChangeFunction={updateReadOnlyMode}
            />
            
            <SettingWidget
                labelText={"Graph Depth"}
                bind:boundValue={graph._depth}
                minValue={0}
                maxValue={3}
                tooltipText={`How many Relationship "steps"\nto render from the central Thing.`}
                onChangeFunction={setGraphDepth}
            />

            <SettingWidget
                labelText={"Zoom"}
                bind:boundValue={graphWidgetStyle.zoom}
                minValue={-5}
                maxValue={5}
                tooltipText={"Zooms the view in and out."}
            />

            <SettingWidget
                labelText={"Relation offset length"}
                bind:boundValue={graphWidgetStyle.relationDistance}
                maxValue={1000}
                tooltipText={"Distance between related Things."}
                onChangeFunction={updateGraphFormat}
            />

            <SettingWidget
                labelText={"Thing size"}
                bind:boundValue={graphWidgetStyle.thingSize}
                maxValue={1000}
                tooltipText={"Size of a single Thing."}
                onChangeFunction={updateGraphFormat}
            />

            <SettingWidget
                labelText={"% Thing spacing"}
                bind:boundValue={graphWidgetStyle.thingSpacingPercent}
                minValue={-100}
                maxValue={100}
                tooltipText={"Distance between sibling Things."}
                onChangeFunction={updateGraphFormat}
            />

            <SettingWidget
                labelText={"Relationship text size"}
                bind:boundValue={graphWidgetStyle.relationshipTextSize}
                maxValue={100}
                tooltipText={"Size of Relationship text."}
                onChangeFunction={updateGraphFormat}
            />

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