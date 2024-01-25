<script>
    // Import stores.
    import { uITrimColorStore } from "$lib/stores"

    // Import utility functions.
    import { onMobile } from "$lib/shared/utility"

    // Import related components.
    import Secret from "./secret.svelte"
</script>

<!-- About menu -->
<div
    class="about-menu"
    class:on-mobile={onMobile()}

    style="background-color: {$uITrimColorStore};"
>    
    <!-- About-menu content. -->
    <div class="content">
        <!-- About-menu text. -->
        <div class="text">
            <p>
                This is a pre-alpha version of "Rig", an app built by Mike
                Gravina.
            </p>
            <p>
                I hope Rig might stimulate conversation around the form
                of digital media - particularly the value in giving writers
                freedom to connect ideas in different, non-linear ways.
            </p>
            <p>
                Watch for new features and bugfixes in the future. And if
                you have any suggestions, please let Mike know!
            </p>
        </div>

        <!-- Copyright. -->
        <div class="copyright">
            © Michael Gravina 2023&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
    </div>

    <Secret />
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
        padding: 1rem 1.25rem 0.5rem 1.25rem;
        gap: 1rem;

        overflow: hidden;
    }

    .about-menu.on-mobile .content {
        padding: 0.25rem 0.5rem 0.25rem 0.5rem;
        gap: 0.5rem;
    }

    .text {
        flex: 1 1 0;

        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: thin;
    }

    p {
        font-size: 0.75rem;
        text-indent: 1rem;
        text-align: justify;
    }

    .about-menu.on-mobile p {
        font-size: 0.75rem;
    }

    .copyright {
        text-align: center;
        font-size: 0.75rem;
        color: grey;
    }

    .about-menu.on-mobile .copyright {
        font-size: 0.6rem;
    }
</style>
  