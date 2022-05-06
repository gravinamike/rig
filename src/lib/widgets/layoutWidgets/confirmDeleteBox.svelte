<script lang="ts">
    import { XButton } from "$lib/widgets/layoutWidgets"

    export let thingWidth: number
    export let thingHeight: number
    export let encapsulatingDepth: number
    export let elongationCategory: "vertical" | "horizontal" | "neutral"
    export let confirmDeleteFunction: () => void
</script>


<div
    class="confirm-delete-container"
    style="border-radius: { 10 + 4 * encapsulatingDepth }px;"
>
    <div class="confirm-delete-blur" />
    <div
        class="confirm-delete-box"
        style="
            width: { thingWidth }px; height: { thingHeight * 0.3 }px;
            flex-direction: { elongationCategory === "vertical" ? "column" : "row" };
            font-size: { thingHeight * ( elongationCategory === "vertical" ? 0.08 : 0.15 ) }px;
        "
    >
        <div>
            DELETE?
        </div>
        <div>
            <XButton
                buttonFunction={confirmDeleteFunction}
                size={20}
                caution={true}
            />
        </div>
    </div>
</div>


<style>
    .confirm-delete-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;

        overflow: hidden;
    }

    .confirm-delete-blur {
        width: 100%;
        height: 100%;
        background-color: gainsboro;
        opacity: 0.75;
    }

    .confirm-delete-box {
        border-top: solid 2px black;

        position: absolute;
        bottom: 0;
        background-color: white;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;

        font-weight: 600;
    }
</style>