<script lang="ts">
    export let thingId: number | null = null;
</script>


<main class="dead-thing-link-widget">
    
    <div class="box">
        <h1>No Thing with ID {thingId}!</h1>
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
        background-color: red;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
</style>