<script lang="ts">
	import { get_only_stored_users } from "$lib/stores/user_session";
	import { base64ToBytes, default_user_list, deriveAESKeyFromPassword, exportAESKeyToBase64, get_user_from_default_userlist, isFreeUser_Storage_Key, remove_user_from_stored_userlist, updateUserByUsername, type Access_Control_Role_Type } from "$lib/utils/AC_Controls";
	import { getLocalStorage } from "$lib/utils/localstorage_utils";
	import { onMount } from "svelte";

    let username: string = $state('')
    let password: string = $state('')
    let user_accepted_being_FreeUser: boolean = $state(true)
    let logged_in_users: Access_Control_Role_Type[] = $state([])

    let show_password_cleartext: boolean = $state(false)
    let show_Error_MSG: boolean = $state(false)

    onMount(()=>{
        user_accepted_being_FreeUser = JSON.parse(getLocalStorage(isFreeUser_Storage_Key)?? 'true')
        logged_in_users = get_only_stored_users()
    })


    function isAStoredUser(uname: string): boolean {
        const idx: number = logged_in_users.findIndex((user: Access_Control_Role_Type)=>{
            if(user.username === uname){
                return true
            } else {
                return false
            }
        })
        const res: boolean = (-1 !== idx)
        return res
    }

    function isAValidUser(uname: string): boolean {
        const idx: number = default_user_list.findIndex((user: Access_Control_Role_Type)=>{
            if(user.username === uname){
                return true
            } else {
                return false
            }
        })
        const res: boolean = (-1 !== idx)
        return res
    }

    async function storeUserCreds(e:Event){
        if(username.replaceAll(' ', '') !== '' && password.replaceAll(' ', '') !== ''){
            const isValidUser: boolean = isAValidUser(username)
            if(isValidUser){
                //Store it
                let user: Access_Control_Role_Type | undefined = get_user_from_default_userlist(undefined, username)
                if(user){
                    user.stored_aes_key = await exportAESKeyToBase64(await deriveAESKeyFromPassword(password, base64ToBytes(user.salt)))
                    updateUserByUsername(username, user)
                    window.location.reload();
                }
            } else {
                e.preventDefault();
                console.log("NOT A VALID USER")
            }
        } else {
            e.preventDefault();
            show_Error_MSG = true
            console.log('Empty Password or Username')
        }
    }

    function reset_values(){
        username = ''
        password = ''
        show_password_cleartext = false
        show_Error_MSG = false
    }

    function setUserAsFree(){
        localStorage.setItem(isFreeUser_Storage_Key, JSON.stringify(true))
    }

    function deleteUserFromStoredUsers(event: Event, user: Access_Control_Role_Type){
        event.preventDefault()
        // console.log('implement deleting user: ' + user.username + ' ID: ' + user.id)
        remove_user_from_stored_userlist(user.id)
        window.location.reload();
    }

    function handle_password_eye(event: Event){
        event.preventDefault();
        show_password_cleartext = !show_password_cleartext
    }
    
</script>



<dialog id="login_modal" class="modal">
  <div class="modal-box w-fit max-w-5xl min-w-max h-fit mt-40 mb-auto bg-primary text-primary-content flex flex-col gap-y-3">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p class="py-4">Have credentials? Enter them here to view additional protected content.<br> Otherwise, feel free to explore the public pages</p>
    {#if show_Error_MSG}
        <div role="alert" class="alert alert-error h-7 flex">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error! Task failed successfully.</span>
        </div>
    {/if}
    <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 {!(user_accepted_being_FreeUser && logged_in_users.length <= 0)? 'visible' : 'hidden'}">✕</button>
        <!-- <p class="py-4">Have credentials? Enter them here to view additional protected content.<br> Otherwise, feel free to explore the public pages or request access by email.</p> -->
        <div class="w-full h-full flex flex-col gap-y-2 ">
            <!-- <label for="username_input" class="w-full flex gap-x-2">
                <p class="underline font-bold my-auto">Username: </p>
                <input type="text" name="" id="username_input" placeholder="Username" class="ml-auto w-5/6 rounded-md text-black" bind:value={username}>
            </label> -->
            <label for="username_input" class="w-full flex gap-x-2">
                <p class="underline font-bold my-auto">Username: </p>
                <select name="" id="" class="text-black w-full" bind:value={username}>
                    <option value="" disabled selected>Select Username</option>
                    {#each default_user_list as user (user)}
                        {@const is_stored_user: boolean = isAStoredUser(user.username)}
                        <option value="{user.username}" class="{is_stored_user? '' : ''}">{user.username}{is_stored_user? ' - (Already Stored)' : ''}</option>
                    {/each}
                </select>
            </label>

            <label for="password_input" class="w-full flex gap-x-2">
                <p class="underline font-bold my-auto">Password: </p>
            {#if show_password_cleartext}
                <input type="text" id="password_input" placeholder="Password" class="ml-auto w-5/6 rounded-md text-black" bind:value={password}>
                <button class="btn btn-ghost" onclick={handle_password_eye} aria-label="show password as cleartext">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
                        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
                    </svg>
                </button>
            {:else}
                <input type="password" id="password_input" placeholder="Password" class="ml-auto w-5/6 rounded-md text-black" bind:value={password}>
                <button class="btn btn-ghost" onclick={handle_password_eye} aria-label="show password as cleartext">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clip-rule="evenodd" />
                    </svg>
                </button>
            {/if}
            </label>

            <div class="flex w-fit gap-x-2 mt-auto ml-auto">
                <button class="btn btn-error" onclick={reset_values}>Cancel</button>
                <button class="btn btn-success" onclick={storeUserCreds}>Login</button>
            </div>
            
            {#if user_accepted_being_FreeUser && logged_in_users.length <= 0}
                <button class="btn btn-warning w-full mt-40" onclick={setUserAsFree}>Continue as a free user</button>
            {:else}
                <div class="w-full h-fit flex flex-col gap-y-1">
                    <!-- eslint-disable-next-line svelte/require-each-key -->
                    {#each logged_in_users as user, index}
                        <div class="flex w-full h-fit mr-auto p-0 pl-1 rounded {index%2==0? 'bg-black/15' : 'bg-white/15'}">
                            <p class="font-semibold my-auto">(ID: {user.id}) - {user.username}</p>
                            <button class="btn btn-error my-auto ml-auto" aria-label="Delete user credentials" onclick={(e)=>{deleteUserFromStoredUsers(e, user)}}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                    <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </form>
  </div>
</dialog>