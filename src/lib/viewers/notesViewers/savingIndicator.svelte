<script lang="ts">
    import { WaitingIndicator, Tooltip } from "$lib/widgets/layoutWidgets"

    export let show = true
</script>


{#if show}
    <div class="saving-indicator">
        <div class="waiting-indicator-container">
            <WaitingIndicator
                states={
                    {
                        waiting: {
                            text: "",
                            imageName: "waiting"
                        },
                    }
                }
                currentStateName={"waiting"}
            />
        </div>

        <div class="icon-color"/>

        <img src="./icons/file.png" alt="New file" width=20px height=20px />
    </div>
{/if}


<style>
    .saving-indicator {
        position: absolute;
        right: 2px;
        top: 5px;
        width: 40px;
        height: 40px;
        opacity: 0.5;

        display: flex;
        align-items: center;
        justify-content: center;

        overflow: visible;
    }

    .icon-color {
        position: absolute;
        left: 7px;
        width: 15px;
        height: 15px;

        background-color: white;
    }

    img {
        margin-right: 11px;
        z-index: 1;
    }

    .waiting-indicator-container {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 40px;
        height: 40px;
        transform: translate(-49%, -50%) scale(1.2, 1.2);
        opacity: 0.5;

        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>