<script lang="ts">
    import type { Graph } from "$lib/shared/graph/graph"

    export let graph: Graph

    const graphOffsetMultiplier = 5
    
    $: planeIds = Object.keys(graph.planes).map((x) => Number(x))
    $: planeDepth = Math.max(...planeIds.map((id) => Math.abs(id)))
    $: offsets = graph.planeOffsets
    $: focalPlaneId = graph.focalPlaneId

    let tracking = false
    let prevLocation: { x: number | null, y: number | null } = { x: null, y: null }

    function changeFocalPlaneId(change: number) {
        if (change === 0) {
            focalPlaneId = 0
        } else {
            const newFocalPlaneId = focalPlaneId + change
            if (planeIds.includes(newFocalPlaneId)) focalPlaneId = newFocalPlaneId
        }
        graph.focalPlaneId = focalPlaneId // Needed for reactivity.
    }

    function handleMouseMove(event: MouseEvent) {
        if (tracking && prevLocation.x && prevLocation.y) {
            offsets[0] += (event.clientX - prevLocation.x) * graphOffsetMultiplier
            offsets[0] = Math.max(offsets[0], -30 * graphOffsetMultiplier)
            offsets[0] = Math.min(offsets[0], 30 * graphOffsetMultiplier)
            offsets[1] += (event.clientY - prevLocation.y) * graphOffsetMultiplier
            offsets[1] = Math.max(offsets[1], -30 * graphOffsetMultiplier)
            offsets[1] = Math.min(offsets[1], 30 * graphOffsetMultiplier)
        }
        prevLocation.x = event.clientX
        prevLocation.y = event.clientY
        graph = graph // Needed for reactivity.
    }

    function resetOffsets() {
        offsets[0] = 0
        offsets[1] = 0
        prevLocation.x = null
        prevLocation.y = null
        graph = graph // Needed for reactivity.
    }
</script>


<div class="plane-controls">
    <div
        class="plane-alignment-controls"
        on:mousedown={() => tracking = true}
        on:mouseup={() => tracking = false}
        on:mousemove={handleMouseMove}
    >
        <div class="centralAnchor">
            {#each planeIds as planeId}
                <div
                    class="square {planeId === 0 ? "plane-0" : ""}"
                    style="width: {25 + 6/Math.max(planeDepth, 1) * planeId}px; height: {25 + 6/Math.max(planeDepth, 1) * planeId}px; left: calc({offsets[0]/graphOffsetMultiplier/Math.max(planeDepth, 1) * planeId}px + 50%); top: calc({offsets[1]/graphOffsetMultiplier/Math.max(planeDepth, 1) * planeId}px + 50%); opacity: {planeId === focalPlaneId ? 60 : 25}%;"
                    on:click={() => {if (planeId === 0) resetOffsets()}}
                ></div>
            {/each}
        </div>
    </div>

    <div class="plane-focus-controls">
        <div class="tab top" on:click={() => changeFocalPlaneId(-1)}>
            <h2>-</h2>
        </div>

        <div class="tab middle" on:click={() => changeFocalPlaneId(0)}>
            <h4>●</h4>
        </div>

        <div class="tab bottom" on:click={() => changeFocalPlaneId(1)}>
            <h2>+</h2>
        </div>
    </div>
</div>


<style>
    .plane-controls {
        display: flex;
        flex-direction: row;
    }

    .plane-focus-controls {
        position: relative;
        width: 30px;
        height: 100px;
    }

    .tab {
        border-top: solid 1px lightgrey;
        border-right: solid 1px lightgrey;
        border-bottom: solid 1px lightgrey;
        border-left: solid 1px whitesmoke;
        
        position: absolute;
        width: 30px;
        background-color: white;

        display: flex;
        justify-content: center;
        align-items: center;

        color: grey;
    }

    .tab:hover {
        background-color: whitesmoke;
    }

    .tab:active {
        color: black;
    }

    .tab.top {
        border-top-right-radius: 5px;

        top: 0px;
        height: 35px;
    }

    .tab.middle {
        border-top-right-radius: 5px;

        top: 35px;
        height: 30px;
    }

    .tab.bottom {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;

        bottom: 0px;
        height: 35px;
    }

    .plane-alignment-controls {
        border: solid 1px lightgrey;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;

        box-sizing: border-box;
        width: 100px;
        height: 100px;
        background-color: white;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .centralAnchor {
        position: relative;
        width: 0px;
        height: 0px;
    }

    .square {
        border-radius: 3px;
        outline: solid 1px black;
        outline-offset: -1px;

        position: absolute;
        transform: translate(-50%, -50%);
        background-color: white;
    }

    .plane-0:hover {
        background-color: whitesmoke;
    }

    .plane-0:active {
        outline: solid 2px black;
        outline-offset: -2px;
    }
</style>