<script lang="ts">
    import type { Graph } from "$lib/models/constructModels"
    import type { GraphWidgetStyle } from "$lib/widgets/graphWidgets"
    import { addGraphIdsNeedingViewerRefresh, readOnlyMode as readOnlyModeStore } from "$lib/stores"
    import SettingWidget from "./settingWidget.svelte"
    import { saveGraphConfig } from "$lib/shared/config"


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


<div class="graph-settings-viewer">
    <h4>Graph settings</h4>

    <SettingWidget
        labelText={"Read-only mode"}
        bind:boundValue={readOnlyMode}
        onChangeFunction={updateReadOnlyMode}
    />
    
    <SettingWidget
        labelText={"Graph Depth"}
        bind:boundValue={graph._depth}
        minValue={0}
        maxValue={3}
        onChangeFunction={setGraphDepth}
    />

    <SettingWidget
        labelText={"Zoom"}
        bind:boundValue={graphWidgetStyle.zoom}
        minValue={-5}
        maxValue={5}
    />

    <SettingWidget
        labelText={"Relation offset length"}
        bind:boundValue={graphWidgetStyle.relationDistance}
        maxValue={1000}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Thing size"}
        bind:boundValue={graphWidgetStyle.thingSize}
        maxValue={1000}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"% Thing spacing"}
        bind:boundValue={graphWidgetStyle.thingSpacingPercent}
        minValue={-100}
        maxValue={100}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Relationship text size"}
        bind:boundValue={graphWidgetStyle.relationshipTextSize}
        maxValue={100}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Thing text size"}
        bind:boundValue={graphWidgetStyle.thingTextSize}
        maxValue={100}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Focal Plane"}
        bind:boundValue={graph.planes.focalPlaneId}
        minValue={-10}
        maxValue={10}
        onChangeFunction={updateGraphFormat}
    />
</div>


<style>
    .graph-settings-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;
        
        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 1.25rem;
        
        text-align: center;

        scrollbar-width: thin;
    }

    h4 {
        margin: 0;
    }
  </style>