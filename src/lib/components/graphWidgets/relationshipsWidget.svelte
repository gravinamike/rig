<script context="module" lang="ts">
    import type { Direction, Space } from "$lib/shared/graph/graphDb"
    import type { Graph, GenerationMember, Cohort } from "$lib/shared/graph/graph"
    import { offsetSignsByHalfAxisId } from "$lib/shared/constants"
    import { retrieveDirections } from "$lib/shared/stores"
</script>

<script lang="ts">
    export let cohort: Cohort
    export let space: Space
    export let offsetLength: number

    const edgeToEdgeDimension = offsetLength - 80

    const cohortMembersWithIndices: { index: number, member: GenerationMember }[] = []
    cohort.members.forEach(function (member, index) {
        cohortMembersWithIndices.push({ index: index, member: member })
    })
    const childrenDimension = cohort.members.length * 80 + (cohort.members.length - 1) * 20

    // Calculate x and y offsets relative to parent Thing Widget.
    const halfAxisId = cohort.address ? cohort.address.halfAxisId : 0
    const offsetSigns = offsetSignsByHalfAxisId[halfAxisId]
    const offsets = [ 0.5 * offsetLength * offsetSigns[0], 0.5 * offsetLength * offsetSigns[1] ]

    // Calculate width and height.
    const height = [1, 2].includes(halfAxisId) ? edgeToEdgeDimension : childrenDimension
    const width = [3, 4].includes(halfAxisId) ? edgeToEdgeDimension : childrenDimension

    // Retrieve Direction information.
    const directionId = space.directionIdByHalfAxisId[halfAxisId] as number
    const direction = retrieveDirections(directionId) as Direction
</script>


<main class="relationships-widget" style="left: calc({offsets[0]}px + 50%); top: calc({offsets[1]}px + 50%); width: {width}px; height: {height}px;">
    <div class="direction-text">
        {direction.text}
    </div>
    <svg class="relationship-image">
        <line style="stroke-width: 2;"
            x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension}"
            x2="{childrenDimension * 0.5}" y2="{edgeToEdgeDimension * 2 / 3}"
        />
        {#each cohortMembersWithIndices as memberWithIndex}
            <line style="stroke-dasharray: 1 5;"
                x1="{childrenDimension * 0.5}" y1="{edgeToEdgeDimension * 2 / 3}"
                x2="{40 + (80 + 20) * memberWithIndex.index}" y2="{edgeToEdgeDimension * 1 / 3}"
            />
            <line style="stroke-width: 2;"
                x1="{40 + (80 + 20) * memberWithIndex.index}" y1="{edgeToEdgeDimension * 1 / 3}"
                x2="{40 + (80 + 20) * memberWithIndex.index}" y2="0"
            />
        {/each}
    </svg> 
</main>


<style>
    main {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    main:hover {
        border-radius: 5px;
        outline: dashed 1px lightgrey;
    }

    .relationship-image {
        position: absolute;
        height: 100%;
        width: 100%;
        stroke:grey;
    }
</style>