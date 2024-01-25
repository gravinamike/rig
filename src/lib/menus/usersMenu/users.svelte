<script lang="ts">
    // Import stores.
    import { userIdStore } from "$lib/stores"

    // Import layout components.
    import { TabBlock, TabFlap, TabFlaps, TabBody } from "$lib/widgets/layoutWidgets"

    // Import submenus.
    import SignUpForm from "./signUp.svelte"
    import SignInForm from "./signIn.svelte"
    import SignOutForm from "./signOut.svelte"
</script>


<!-- Users menu. -->
<div
    class="users-menu"
>    
    <!-- If a user is already signed in, show a sign-out form. -->
    {#if $userIdStore}
        <SignOutForm />

    <!-- Otherwise, show tabs for the sign-in and sign-up forms. -->
    {:else}
        <div class="tabs-container">
            <TabBlock>
                <TabFlaps>
                    <TabFlap><span class="tab-flap-span">Sign in</span></TabFlap>
                    <TabFlap><span class="tab-flap-span">Sign up</span></TabFlap>
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


<style>
    .users-menu {
        border-radius: 0 0 5px 5px;
        box-sizing: border-box;

        position: relative;
        height: 100%;
        background-color: white;

        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        gap: 1rem;
    }

    .tabs-container {
        box-shadow: 0 0 2px 1px silver;
        border-radius: 5px;

        width: 100%;
        height: 100%;
        
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .tab-flap-span {
        font-size: 0.9rem;
        font-weight: 600;
    }
</style>
  