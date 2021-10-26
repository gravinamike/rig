<script lang="ts">
    import type { ThingPlaceholderWidgetModel } from "$lib/shared/graph/graph"

    export let thingPlaceholderWidgetModel: ThingPlaceholderWidgetModel
</script>


<main class="thing-placeholder-widget">
    <div class="box">
        PLACEHOLDER FOR THING {thingPlaceholderWidgetModel.thingId}
    </div>
</main>


<style>
    .box {
        width: 50px;
        height: 50px;
        padding: 1rem;
        font-size: 0.35rem;
        font-weight: 400;
        border-radius: 10px;
        border-color: green;
    }
</style>