<script context="module" lang="ts">
    export async function load({ fetch }: { fetch: any }) {
        const res = await fetch(`/api/thing`);
  
        if (res.ok) return {
            props: { things: await res.json() }
        };
        return {
            status: res.status,
            error: new Error()
        };
    }
</script>
  
<script lang="ts">
    export let things: any[];// Narrow this from any to Thing[]
</script>


<main>
    {#each things as { text, note }}
        <div class="box">
            <h1>{text}</h1>
            {@html note.text}
        </div>
    {/each}
</main>


<style>
    main {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .box {
        padding: 1rem;
        margin: 1rem;
        box-shadow: 5px 5px 10px 2px lightgray;
    }
    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
  </style>