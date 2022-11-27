<script lang="ts">
    export let toggled = false
</script>


<div class="toggle {toggled ? "toggled" : ""}" on:click={() => {toggled = !toggled}} on:keydown={()=>{}}>
    <div class="slider {toggled ? "toggled" : ""}" />
</div>

  
<style>
    .toggle {
        border-radius: 10px;

        box-sizing: border-box;
        width: 24px;
        height: 16px;
        background-color: lightgrey;

        padding: 2px;

        cursor: pointer;
    }

    .toggle.toggled {
        background-color: darkgrey;
    }

    .slider {
        border-radius: 6px;

        width: 12px;
        height: 12px;
        background-color: whitesmoke;

        transition: 0.25s;
    }

    .slider.toggled {
        transform: translateX(8px);
    }
</style>