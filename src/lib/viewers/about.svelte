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

<div class="about-menu">
    <h4>About</h4>
    
    <div>
        This is Mike Gravina's attempt at building a domain-general, high-dimensional semantic medium.
    </div>

    <div class="secret" on:click={displaySecret}>
        ?
    </div>
</div>
  
<style>
    .about-menu {
        outline: solid 1px lightgrey;
        outline-offset: -1px;

        box-sizing: border-box;
        height: 100%;
        background-color: #fafafa;

        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        gap: 1.25rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    h4 {
        margin: 0;

        text-align: center;
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
  