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

    <div class="content">
        <h4>Graph settings</h4>

        <div class="setting-widgets">
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

    </div>

</div>


<style>
    .graph-settings-viewer {        
        box-sizing: border-box;
        height: 100%;
        background-color: #E8E8E8;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        
        text-align: center;
    }

    .content {
        border-radius: 5px;

        height: 100%;
        background-color: white;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 2rem;
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