<script lang="ts">
    // Import types.
    import type { GenerationMember, Thing } from "$lib/models/constructModels"

    // Import stores.
    import { preventEditing, relationshipBeingCreatedInfoStore, reorderingInfoStore } from "$lib/stores"

    // Import widget controller.
    import RelationshipFanSegmentWidgetController from "./controller.svelte"

    // Import related widgets.
    import { XButton } from "$lib/widgets/layoutWidgets"
    import { onMobile } from "$lib/shared/utility";


    /**
     * @param thingCohortMemberWithIndex - Object containing the index and the Generation Member the widget is based on.
     * @param thingIdOfHoveredRelationship - ID of any Thing that the mouse is hovering over.
     * @param relatableForCurrentDrag - Whether the widget is a valid target for an in-progress drag-relate operation.
     * @param tweenedScale - The scale of the Graph widget, smoothly interpolated across changes.
     * @param midline - The horizontal midline of the Relationship Stem.
     * @param fanBottom - The vertical position of the bottom of the Relationship Fan.
     * @param leafGeometry - The coordinates of the points of the Relationship Leaf.
     * @param relationshipColor - The color of the Relationship widget.
     */
    export let thingCohortMemberWithIndex: { index: number, member: GenerationMember }
    export let thingIdOfHoveredRelationship: number | null
    export let relatableForCurrentDrag: boolean
    export let tweenedScale: number
    export let midline: number
    export let fanBottom: number
    export let leafGeometry: { bottom: number, top: number, bottomMidline: number, topMidline: number }
    export let relationshipColor: string
    export let openCommandPalette: (event: MouseEvent) => void
    export let deleteRelationship: () => void
    

    // Attributes managed by widget controller.
    let thing: Thing
    let fanSegmentHovered = false
    let fanSegmentClicked = false
    let highlightLevel: "no-highlight" | "soft-highlight" | "hard-highlight"
    let relationshipHovered: boolean
    let deleteButtonRotation = 0
    let willBeDeleted: boolean
</script>


<RelationshipFanSegmentWidgetController
    {thingCohortMemberWithIndex}
    {thingIdOfHoveredRelationship}
    {relatableForCurrentDrag}
    {fanSegmentHovered}
    {fanSegmentClicked}

    bind:thing
    bind:highlightLevel
    bind:relationshipHovered
    bind:deleteButtonRotation
    bind:willBeDeleted
/>


<!-- Delete button. -->
{#if !onMobile()}
    <div
        class="delete-button-group"
        style="
            left: {leafGeometry.bottomMidline}px;
            top: {leafGeometry.bottom}px;
            width: 20px;
            height: 20px;
            transform: translate(-10px, -10px) rotate({deleteButtonRotation}deg);
        "

        on:mouseenter={()=>{
            fanSegmentHovered = true
            relationshipHovered = true
            thingIdOfHoveredRelationship = thing.id || null
        }}
        on:mouseleave={()=>{fanSegmentHovered = false; relationshipHovered = false; thingIdOfHoveredRelationship = null}}
    >
        {#if (
            // Show delete button if the Relationship is hovered, except those relating to Thing Forms.
            !$preventEditing
            && !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag)
            && !$reorderingInfoStore.reorderInProgress
            && relationshipHovered
            && thingCohortMemberWithIndex.member
        )}
            <XButton
                size={20}
                buttonFunction={deleteRelationship}
                trashIcon={true}
            />
        {/if}
    </div>
{/if}

<!-- Relationship fan segment. -->
<svg
    class="relationship-fan-segment"
    style="
        stroke: {relationshipColor};
        fill: {relationshipColor};
    "
    on:mouseenter={()=>{
        thingIdOfHoveredRelationship = thing.id || null
    }}
    on:mouseleave={()=>{
        thingIdOfHoveredRelationship = null
    }}
>
 
    <!-- Hoverable zone of fan segment. -->
    <line
        class="fan-segment-hover-zone"
        class:read-only-mode={$preventEditing}

        x1="{midline}" y1="{fanBottom}"
        x2="{leafGeometry.bottomMidline}" y2="{leafGeometry.bottom}"
        style="stroke-width: {8 / tweenedScale};"
        
        on:mouseenter={()=>{fanSegmentHovered = true}}
        on:mouseleave={()=>{fanSegmentHovered = false}}
        on:mousedown={()=>{fanSegmentClicked = true}}
        on:touchstart={()=>{fanSegmentClicked = true}}
        on:mouseup={()=>{fanSegmentClicked = false}}
        on:touchend={()=>{fanSegmentClicked = false}}
        on:contextmenu|preventDefault={ (event) => {if (onMobile() && !$preventEditing) openCommandPalette(event)} }
    />

    <!-- Visual image of fan segment. -->
    <line 
        class="fan-segment-image"
        class:soft-highlight={ highlightLevel === "soft-highlight" }
        class:hard-highlight={ highlightLevel === "hard-highlight" }

        x1="{midline}" y1="{fanBottom}"
        x2="{leafGeometry.bottomMidline}" y2="{leafGeometry.bottom}"
        style="stroke-width: {3 / tweenedScale};"
    />  

    <!-- Will-be-deleted indicator -->
    {#if !($relationshipBeingCreatedInfoStore.sourceThingId && !relatableForCurrentDrag) && willBeDeleted}
        <svg
            class="will-be-deleted-indicator"
            x={leafGeometry.bottomMidline}
            y={leafGeometry.bottom}
        >
            <line x1=2 y1=2 x2=18 y2=18 />
            <line x1=18 y1=2 x2=2 y2=18 />
        </svg>
    {/if}

</svg>


<style>
    .relationship-fan-segment {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;

        overflow: visible;
    }

    .fan-segment-hover-zone {
        opacity: 0;

        pointer-events: none;
    }

    .fan-segment-hover-zone:not(.read-only-mode) {
        pointer-events: auto;
        cursor: pointer;
    }

    .fan-segment-image {
        opacity: 0.05;
    }

    .fan-segment-image.soft-highlight {
        opacity: 0.1;
    }

    .fan-segment-image.hard-highlight {
        opacity: 0.25;
    }

    .delete-button-group {
        position: absolute;
        z-index: 2;

        pointer-events: auto;
        cursor: pointer;
    }

    .will-be-deleted-indicator {
        transform: translate(-10px, -10px);
        stroke: red;
        stroke-width: 3px;
    }
</style>