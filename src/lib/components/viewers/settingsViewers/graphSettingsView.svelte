<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"
    import SettingWidget from "$lib/components/layoutElements/settingWidget.svelte"

    export let graph: Graph

    function updateGraphFormat() {
        graph = graph // Needed for reactivity.
    }

    async function buildGeneration() {
        await graph.buildGeneration()
        graph = graph // Needed for reactivity.
    }

    async function stripGeneration() {
        await graph.stripGeneration()
        graph = graph // Needed for reactivity.
    }
</script>


<main>
    <h4>Graph settings</h4>

    <SettingWidget
        labelText={"Relation offset length"}
        bind:boundValue={graph.graphWidgetStyle.offsetLength}
        maxValue={1000}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Thing size"}
        bind:boundValue={graph.graphWidgetStyle.thingSize}
        maxValue={1000}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Between-Thing gap"}
        bind:boundValue={graph.graphWidgetStyle.betweenThingGap}
        maxValue={1000}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Relationship text size"}
        bind:boundValue={graph.graphWidgetStyle.relationshipTextSize}
        maxValue={100}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Thing text size"}
        bind:boundValue={graph.graphWidgetStyle.thingTextSize}
        maxValue={100}
        onChangeFunction={updateGraphFormat}
    />

    <SettingWidget
        labelText={"Focal Plane"}
        bind:boundValue={graph.focalPlaneId}
        minValue={-10}
        maxValue={10}
        onChangeFunction={updateGraphFormat}
    />

    <button on:click={buildGeneration}>
        Build Generation
    </button>
    
    <button on:click={stripGeneration}>
        Strip Generation
    </button>
</main>


<style>
    main {
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
    }

    h4 {
        margin: 0;
    }
  </style>