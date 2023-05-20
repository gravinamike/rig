<script>
    import { uITrimColorStore } from "$lib/stores";


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

<div
    class="about-menu"

    style="background-color: {$uITrimColorStore};"
>    
    <div class="content">
        <div class="text">
            <p>
                This is a pre-alpha version of "Rig", an app built by Mike
                Gravina to help depict the connections between things.
            </p>
            <p>
                I hope Rig might stimulate conversation around the form
                of digital media - particularly the value in giving writers
                freedom to connect ideas in many different, non-linear ways.
            </p>
            <p>
                Watch for new features and bugfixes in the future. And if
                you have any suggestions, please let Mike know!
            </p>
        </div>

        <div class="copyright">
            © Michael Gravina 2023&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
    </div>

    <div class="secret" on:click={displaySecret} on:keydown={()=>{}}>
        ?
    </div>
</div>
  
<style>
    .about-menu {
        box-sizing: border-box;
        position: relative;
        height: 100%;

        display: flex;
        flex-direction: column;
    }

    .content {
        border-radius: 0 0 5px 5px;

        height: 100%;
        background-color: white;

        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem 0.5rem 1rem;
        gap: 1rem;
    }

    .text {
        flex: 1 1 0;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    p {
        font-size: 0.9rem;
        text-indent: 1rem;
        text-align: justify;
    }

    .copyright {
        text-align: center;
        font-size: 0.75rem;
        color: grey;
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
  