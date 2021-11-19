<script lang="ts">
    import { slide } from "svelte/transition"

    export let headerText: string
    export let contentDirection: "down" | "up" | "right" | "left" = "down"
    export let expanded: boolean = false
    
    let verticalOrHorizontal = ["down", "up"].includes(contentDirection) ? "vertical" : "horizontal"
</script>


<div class="collapser {verticalOrHorizontal}">

    <!-- Collapser header -->
    <div class="header {verticalOrHorizontal} {contentDirection}">
        <h3>
            <div class="button" aria-expanded={expanded} on:click|stopPropagation={() => expanded = !expanded}>
                {#if contentDirection === "down"}
                    {expanded ? "▼" : "►"}
                {:else if contentDirection === "up"}
                    {expanded ? "▲" : "►"}
                {:else if contentDirection === "right"}
                    {expanded ? "►" : "▼"}
                {:else if contentDirection === "left"}
                    {expanded ? "◄" : "▼"}
                {/if}
            </div>

            <div class="header-text">{headerText}</div>
        </h3>
    </div>
    
    <!-- Collapser content -->
    {#if expanded}

        {#if verticalOrHorizontal === "vertical"}
            <div class="content" transition:slide>
                <slot></slot>
            </div>
        {:else}
            <div class="content">
                <slot></slot>
            </div>
        {/if}
        
    {/if}
</div>


<style>
    .collapser {
        height: 100%;

        display: flex;
    }
    
    .collapser.vertical {
        flex-direction: column;
    }

    .collapser.horizontal {
        flex-direction: row;
    }

    .header h3 {
        display: flex;
        flex-direction: row;
        gap: 5px;
    }

    .header.horizontal {
        margin: 0;
        display: flex;
        flex-direction: row;
    }

    .header.down{
        border-bottom: 1px solid lightgrey;
    }

    .header.up{
        border-top: 1px solid lightgrey;
    }

    .header.right{
        border-right: 1px solid lightgrey;
    }

    .header.left{
        border-left: 1px solid lightgrey;
    }

    .header.up, .header.left {
        order: 1;
    }

    .header.down h3 {
        margin: 0 0 0 0;
    }

    .header.up h3 {
        margin: 0 0 0 0;
    }

    .header.right h3 {
        margin: 0.25rem 0.25rem 0 0;
    }

    .header.left h3 {
        margin: 0.25rem 0 0 0.25rem;
    }

    .button {
        height: 1.5rem;
        width: 1.5rem;
        text-align: center;
        cursor: pointer;
    }

    .header.horizontal .header-text {
        position: absolute;
    }

    .header.right .header-text {
        transform: translateY(125%) rotate(-90deg) translateX(-100%);
        transform-origin: top left;
    }

    .header.left .header-text {
        transform: translateY(25%) rotate(90deg);
        transform-origin: bottom left;
    }

    .content {
        height: 100%;
    }

    .content.up, .content.left {
        order: 0;
    }
</style>