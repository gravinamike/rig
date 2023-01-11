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
        <p>
            This is Mike Gravina's attempt at building a general-purpose medium
            for depicting how things are related to each other.
        </p>
        <p>
            "Rig" is intended to overcome some of the limitations of
            traditional, linear text. In particular, it can be difficult to
            capture all the details of very complex systems when the content of
            a model has to be arranged as a single long sequence, one section
            after the other.
        </p>
        <p>
            In Rig, content can be connected in many different ways, across a
            large number of dimensions. The hope is that, together with
            traditional forms of text, this can be useful for dealing with many
            complex issues that are difficult to discuss with text alone.
        </p>
        <p>
            Rig is in very early development. Watch for new features and bugfixes
            in the future. And if you have any suggestions, let Mike know!
        </p>
    </div>

    <div class="secret" on:click={displaySecret} on:keydown={()=>{}}>
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
  