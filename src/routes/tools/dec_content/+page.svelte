<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
	import { available_users, get_only_stored_users, init_userSession, load_storage_userlist_into_memory } from "$lib/stores/user_session";
    import { base64ToBytes, bytesToBase64__small_data, create_random_iv, createRandomAES256Key, decryptAESGCM256, deriveAESKeyFromPassword, encryptAESGCM256, exportAESKeyToBase64, importAESKeyFromBase64, init_user_storage_with_default_values, list_of_Possible_MimeTypes, remove_user_from_stored_userlist, updateUserById, type Access_Control_Role_Type, type default_user_list, type Possible_MimeTypes, type ProtectedAssets, type Wrapped_Key } from "$lib/utils/AC_Controls";
	import { onMount } from "svelte";




    onMount(async ()=>{
        //loading all stored users
        load_storage_userlist_into_memory()
        stored_userlist = get_only_stored_users()
        // console.log(stored_userlist)
    })


    //TEST INPUT
    let selectedUser: Access_Control_Role_Type | null = $state(null)
    let inputString_OBJ: string = $state('')

    
    //https://www.codertools.net/tools/pbkdf2.php?lang=de
    let content_MimeType: Possible_MimeTypes = $state('')
    let content_is_complete: boolean = $state(false)


    let stored_userlist: Access_Control_Role_Type[] = $state([] as Access_Control_Role_Type[])
    let update_stored_user_list: boolean = $state(false)

    // output data
    let output: string = $state('Nothing to see here!')




    function handleProfileSelect(user: Access_Control_Role_Type){
        if(selectedUser && selectedUser.id === user.id){
            selectedUser = null
        } else {
            selectedUser = user
        }
    }


    function findSuitableWrappedKey(user: Access_Control_Role_Type, wkeys: Wrapped_Key[]): Wrapped_Key | undefined {
        const res_wkey: Wrapped_Key | undefined = wkeys.find((key: Wrapped_Key)=>{
            if(key.role_id === user.id) return key
        })
        return res_wkey
    }



    async function decrypt_content_for_selected_users(){
        const parsed_asset: ProtectedAssets = JSON.parse(inputString_OBJ)
        if(selectedUser && parsed_asset.wrapped_keys.length > 0){
            const suitable_wkey: Wrapped_Key | undefined = findSuitableWrappedKey(selectedUser, parsed_asset.wrapped_keys) 
            if(suitable_wkey && selectedUser.stored_aes_key){
                const user_aes_key: CryptoKey = await importAESKeyFromBase64(selectedUser.stored_aes_key)
                const iv_wkey: BufferSource = base64ToBytes(suitable_wkey.iv)
                // console.log(suitable_wkey, selectedUser.stored_aes_key)

                
                let decrpyted_content_key: string = await decryptAESGCM256(suitable_wkey.wKey, user_aes_key, iv_wkey)
                let plaintext: string = await decryptAESGCM256(parsed_asset.content.ciphertext, await importAESKeyFromBase64(decrpyted_content_key), base64ToBytes(parsed_asset.content.iv))
                output = plaintext

            } else {
                console.log('ERR:: Either selectedUser has no stored aes key OR there are no suitable wrapped keys found ==> i.e the selectedUser has no access rights to this asset')
            }
        } else {
            console.log('ERR:: Either no User selected OR there are no wrapped keys in the input object')
        }
    } 


    $effect(()=>{
        if(update_stored_user_list){
            stored_userlist = get_only_stored_users()
            update_stored_user_list = false
        }
    })


    function check_completeness_of_input(): boolean{
        if(!inputString_OBJ || !selectedUser || !content_MimeType){
            return false
        }
        return true
    }

    $effect(()=>{
        if(content_MimeType || selectedUser){
            content_is_complete = check_completeness_of_input()
        }
    })


</script>

<div class="w-full h-full flex flex-col gap-x-2 p-3">
    <p class="underline text-xl mb-3">Decryption Helper:</p>
    <div class="flex size-full gap-x-3">
        <div class="w-4/10 h-full flex flex-col">

            <!-- Selecting User -->
            <div class="flex flex-col w-full">
                <p>Select User:</p>
                {#if stored_userlist.length > 0}
                    {#each stored_userlist as user (user)}
                    {@const selected: boolean = (selectedUser && selectedUser.id === user.id)? true : false}
                        <button class="btn flex {selected? 'btn-success' : 'btn-ghost'}" onclick={()=>{handleProfileSelect(user)}}>
                            <p class="mr-auto">{user.username}</p>
                            <p class="ml-auto">(ID: {user.id})</p>
                        </button>
                    {/each}
                {:else}
                    <p>--- No Stored Users Available ---</p>
                {/if}
            </div>

            <div class="divider"></div>

            <div class="flex flex-col h-full w-full gap-y-2 text-lg">


                <select class="select w-full bg-neutral-content text-neutral" bind:value={content_MimeType}>
                    <option value="" selected disabled>Choose MimeType</option>
                    {#each list_of_Possible_MimeTypes as mt (mt)}
                        <option value="{mt}">{mt}</option>                        
                    {/each}
                </select>


                <label for="" class="flex items-center w-full h-full max-h-min gap-x-2 text-nowrap">
                    <!-- <p>Input</p> -->
                    <!-- <div class="divider divider-horizontal mx-0"></div> -->
                    <div class="flex flex-col w-full h-full max-h-min">
                        <!-- <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full h-full" placeholder="Content Ciphertext" bind:value={inputString} disabled={inputString_OBJ.replaceAll(' ', '').length > 0}>
                        <div class="divider">or</div> -->
                        <textarea class="bg-neutral-content text-neutral input ml-auto w-full min-h-50" placeholder="Protected Asset Object" bind:value={inputString_OBJ}></textarea>
                    </div>
                </label>

                <!-- <label for="" class="flex items-center w-full gap-x-2 text-nowrap">
                    <p>AES Key (b64)</p>
                    <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full" placeholder="AES Content Key" bind:value={content_aes_key}>
                    <button class="btn btn-secondary w-fit h-full" aria-label="random aes_key" onclick={choose_random_content_aes_key}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
                        </svg>
                    </button>
                </label>

                <label for="" class="flex items-center w-full gap-x-2 text-nowrap">
                    <p>IV (b64)</p>
                    <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full" placeholder="Initiation Vector" bind:value={content_iv}>
                    <button class="btn btn-secondary w-fit h-full" aria-label="random iv" onclick={choose_random_encryption_iv}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z" />
                        </svg>
                    </button>
                </label> -->

                <button class="btn btn-success {content_is_complete? '' : 'btn-disabled'}" onclick={decrypt_content_for_selected_users}>Decrypt</button>
            </div>
        </div>

        <div class="w-6/10 h-full flex flex-col">
            {#if content_MimeType === 'text/plain'}
            <!--  -->
            <textarea name="" id="" class="size-full text-black" bind:value={output} readonly></textarea>
            {:else}
            <textarea name="" id="" class="size-full text-black" bind:value={output} readonly></textarea>
            {/if}
        </div>
    </div>
    
</div>