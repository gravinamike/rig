<script>
    const catPic = `
                                                                         Meow.
                                                                         /
                                                    *    *    *   *
                                                     ||   ||   ||   ||
                                              @%@%@%@%@
                                              {===========}
                                              {==  Genie is   ==}
                                           @%@%@%@%@%@
                                            {===  Great!!!!   ===}
                                            {=============}
                                           @%@%@%@%@%@
`
    function displaySecret() {
        alert(`\n${catPic}\n\n`)
    }
</script>


<div class="secret" on:click={displaySecret} on:keydown={()=>{}}>
    ?
</div>


<style>
    .secret {
        border-radius: 5px;

        position: absolute;
        bottom: 25px;
        right: 25px;
        width: 25px;
        height: 25px;
        color: white;

        cursor: pointer;
    }

    .secret:hover {
        box-shadow: 2px 2px 5px 2px lightgray;

        text-align: center;
        line-height: 25px;
        color: grey;
    }
</style>
  