<script lang="ts">
    
</script>


<div class="history-viewer">
    <h4>Spaces</h4>

    <div
        class="box"
    >
        TEST
    </div>
</div>


<style>
    .history-viewer {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        overflow-x: hidden;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
        
        text-align: center;
    }

    h4 {
        margin: 0;
    }

    .box {
        border-radius: 10px;
        box-shadow: 5px 5px 10px 2px lightgray;

        height: max-content;
        background-color: white;
        
        display: flex;
        flex-direction: column;
        padding: 0.33rem;
        gap: 10px;

        font-size: 0.65rem;
        text-align: left;

        cursor: default;
    }

    .box:hover {
        box-shadow: 5px 5px 10px 10px lightgray;
    }
  </style>