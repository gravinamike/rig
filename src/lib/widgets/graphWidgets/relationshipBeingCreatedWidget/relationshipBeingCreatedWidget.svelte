<script lang="ts">
    import type { ThingWidgetModel, RelationshipsWidgetModel } from "$lib/models/widgetModels";
    import { relationshipBeingCreatedInfoStore, disableRelationshipBeingCreated } from "$lib/stores"
    import { relationshipColorByHalfAxisId } from "$lib/shared/constants"
    

    let show: boolean
    let sourceWidgetModel: ThingWidgetModel | RelationshipsWidgetModel | null
    let startPositionX: number
    let startPositionY: number
    let endPositionX: number
    let endPositionY: number

    let angleInRadians: number
    let angleInDegrees: number

    let lineStartPositionX: number
    let lineStartPositionY: number
    let lineEndPositionX: number
    let lineEndPositionY: number

    let color: string


    $: if ($relationshipBeingCreatedInfoStore) {
        show = $relationshipBeingCreatedInfoStore.sourceWidgetModel ? true : false;
        sourceWidgetModel = $relationshipBeingCreatedInfoStore.sourceWidgetModel;
        [startPositionX, startPositionY] = $relationshipBeingCreatedInfoStore.startPosition;
        [endPositionX, endPositionY] = $relationshipBeingCreatedInfoStore.endPosition;

        angleInRadians = Math.atan2(endPositionY - startPositionY, endPositionX - startPositionX)
        angleInDegrees = angleInRadians / Math.PI * 180

        lineStartPositionX = startPositionX + 4 * Math.cos(angleInRadians)
        lineStartPositionY = startPositionY + 4 * Math.sin(angleInRadians)
        lineEndPositionX = endPositionX - 8 * Math.cos(angleInRadians)
        lineEndPositionY = endPositionY - 8 * Math.sin(angleInRadians)

        color = sourceWidgetModel && sourceWidgetModel.kind === "relationshipsWidgetModel" ? 
            relationshipColorByHalfAxisId[sourceWidgetModel.halfAxisId] :
            "black"
    }

    // Handling outside mouse releases.
	function handleMouseUp() {
		if (show) {
			disableRelationshipBeingCreated()
		}
	}
</script>


<svelte:body
    on:mouseup={handleMouseUp}
/>


{#if show}
    <svg class="relationship-being-created-widget">
        <!-- Visual image of stem. -->
        <g
            class="relationship-being-created-image"
            style="stroke: {color}; fill: {color};"
        >
            <line
                x1="{lineStartPositionX}" y1="{lineStartPositionY}"
                x2="{lineEndPositionX}" y2="{lineEndPositionY}"
                stroke-width=10
                stroke-linecap="round"
            />
            <polygon
                points="
                    {endPositionX - 5}, {endPositionY + 8}
                    {endPositionX + 5}, {endPositionY + 8}
                    {endPositionX}, {endPositionY}
                "
                style="stroke-width: 3; transform: rotate({angleInDegrees + 90}deg); transform-origin: {endPositionX}px {endPositionY}px;"
            />
        </g>
    </svg>
{/if}


<style>
    .relationship-being-created-widget {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 1;

        overflow: visible;

        pointer-events: none;
    }
</style>