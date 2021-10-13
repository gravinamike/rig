<script lang="ts">
    import type { Thing } from "$lib/shared/graph";
    import CohortWidget from "$lib/components/graphWidgets/cohortWidget.svelte"

    export let thingIds: number[];
</script>


<main>
    <div class="centralAnchor">
        <CohortWidget
            parentGeneration={null}
            halfAxisId={0}
            parentSpace={null}
            {thingIds}
        />
    </div>
</main>


<style>
    main {
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
        outline: solid 1px;
    }
    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }
  </style>