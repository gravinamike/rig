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
    <div class="content">
        <h4>About</h4>

        <div>
            <p>
                This is an early version of an application by Mike Gravina called
                Rig. It's focused on "Graphs", which are diagrams of the
                connections between different things.
            </p>
            <p>
                I hope Rig might serve to stimulate conversation around the form
                of digital media. In particular, I'd like to highlight the fact
                that it can be difficult to capture all the nuance of more complex
                topics when content has to be arranged in linear sequence, one
                section after another.
                
            </p>
            <p>
                In Rig, content can be connected in many different ways, across a
                large number of "dimensions". My hope is that Rig can serve as
                an evolving model of new conventions for representing knowledge -
                conventions that build on the traditional linear form with new
                tools for constructing rich and flexible models of the world.
            </p>
            <p>
                Rig is in very early development. Watch for new features and bugfixes
                in the future. And if you have any suggestions, let Mike know!
            </p>
        </div>
    </div>

    <div class="secret" on:click={displaySecret} on:keydown={()=>{}}>
        ?
    </div>
</div>
  
<style>
    .about-menu {
        box-sizing: border-box;
        height: 100%;
        background-color: #E8E8E8;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    h4 {
        margin: 0;

        text-align: center;
    }

    .content {
        flex: 1 1 0;

        border-radius: 5px;

        background-color: white;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 1rem;
    }

    p {
        font-size: 0.9rem;
        text-indent: 1rem;
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
  