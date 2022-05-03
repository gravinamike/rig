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
        alert(`\n${catPic}\n\n`);
    }
</script>

<main>
    <h1>ABOUT</h1>

    <hr />
    
    <div>
        This is Mike Gravina's attempt at building a domain-general, high-dimensional semantic medium.
    </div>

    <div class="secret" on:click={displaySecret}>
        ?
    </div>
</main>
  
<style>
    main {
        border-radius: 5px;
        box-shadow: 5px 5px 10px 10px lightgray;

        margin: 5rem;

        padding: 2rem;

        font-size: 1rem;
    }

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
        box-shadow: 5px 5px 10px 10px lightgray;

        text-align: center;
        line-height: 25px;
        color: grey;
    }
</style>
  