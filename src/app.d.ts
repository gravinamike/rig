/// <reference types="@sveltejs/kit" />

declare namespace App {
    //interface Error {}
    interface Locals {
        user: { username: string } | null
    }
    //interface PageData {}
    //interface Platform {}
}