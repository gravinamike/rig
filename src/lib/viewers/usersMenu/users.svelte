<script lang="ts">
    import { uITrimColorStore, userIdStore } from "$lib/stores"

    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    import SignUpForm from "./signUp.svelte"
    import SignInForm from "./signIn.svelte"
    import SignOutForm from "./signOut.svelte"
</script>


<div
    class="users-menu"

    style="background-color: {$uITrimColorStore};"
>    
    <div class="content">

        {#if $userIdStore}

            <SignOutForm />

        {:else}

            <div class="tabs-container">

                <TabBlock>
                    <TabFlaps>
                        <TabFlap>Sign in</TabFlap>
                        <TabFlap>Sign up</TabFlap>
                    </TabFlaps>

                    <TabBody>
                        <SignInForm />
                    </TabBody>

                    <TabBody>
                        <SignUpForm />
                    </TabBody>
                </TabBlock>
                
            </div>

        {/if}

    </div>
</div>


<style>
    .users-menu {
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

    .tabs-container {
        width: 100%;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }
</style>
  