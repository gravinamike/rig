<script lang="ts">
    import type { Thing } from "../../api/graph";
    import CohortWidget from "./cohortWidget.svelte"

    export let things: Thing[];
</script>


<main>
    <div class="centralAnchor">
        <CohortWidget
            parentGeneration={null}
            halfAxisId={0}
            parentSpace={null}
            {things}
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