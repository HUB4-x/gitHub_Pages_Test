<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars */
	import { available_users, get_only_stored_users, init_userSession, load_storage_userlist_into_memory } from "$lib/stores/user_session";
    import { base64ToArrayBuffer, base64ToBytes, bytesToBase64__small_data, create_random_iv, createRandomAES256Key, deriveAESKeyFromPassword, encryptAESGCM256, encryptFile, exportAESKeyToBase64, importAESKeyFromBase64, init_user_storage_with_default_values, list_of_Possible_MimeTypes, remove_user_from_stored_userlist, updateUserById, type Access_Control_Role_Type, type default_user_list, type Possible_MimeTypes, type ProtectedAssets, type Wrapped_Key } from "$lib/utils/AC_Controls";
	import { onMount } from "svelte";




    onMount(async ()=>{
        //loading all stored users
        load_storage_userlist_into_memory()
        stored_userlist = get_only_stored_users()
        // console.log(stored_userlist)
    })


    //INPUT
    let inputString: string = $state('')
    let Inputfiles: FileList | null = $state(null)
    let fileContent: string | ArrayBuffer | null = $state(null)


    // selected user data
    let selectedProfilesIdx: number[] = $state([])
    let selectedUsers: Access_Control_Role_Type[] = $state([])

    
    //https://www.codertools.net/tools/pbkdf2.php?lang=de
    // let use_Encryption_Password_or_AESKey: 'pass' | 'aes_key' = $state('pass') //Maybe if wanted to input not an aes content key but a password... 
    let content_iv: string = $state('')
    let content_aes_key: string = $state('')
    let content_password: string = $state('')
    let content_Asset_name: string = $state('')
    let content_MimeType: Possible_MimeTypes = $state('')
    let content_is_complete: boolean = $state(false)


    let stored_userlist: Access_Control_Role_Type[] = $state([] as Access_Control_Role_Type[])
    let update_stored_user_list: boolean = $state(false)

    // output data
    let output: string = $state('Nothing to see here!')
    let resulting_enc_obj: ProtectedAssets | undefined = $state(undefined)




    function handleProfileSelect(user: Access_Control_Role_Type){
        if(!check_if_user_is_selected(user.id)){
            selectedProfilesIdx.push(user.id)
            selectedUsers.push(user)
        } else {
            selectedProfilesIdx.splice(selectedProfilesIdx.indexOf(user.id), 1)
            selectedUsers.splice(selectedUsers.findIndex((u)=>{return u.id === user.id}), 1)
        }
    }

    function check_if_user_is_selected(index: number){
        return selectedProfilesIdx.includes(index)
    }


    function choose_random_encryption_iv(){
        content_iv = create_random_iv()
    }

    async function choose_random_content_aes_key(){
        content_aes_key = await exportAESKeyToBase64(await createRandomAES256Key())
    }


    async function encrypt_content_for_selected_users(){
        let res: ProtectedAssets = {content: {ciphertext: '', iv: '', plaintext:''}} as ProtectedAssets
        if(inputString){
            res.content.ciphertext = await encryptAESGCM256(inputString, await importAESKeyFromBase64(content_aes_key), base64ToBytes(content_iv))
        } else if (Inputfiles){
            // ciphertext = await encryptAESGCM256(base64_file_content, await importAESKeyFromBase64(content_aes_key), base64ToBytes(content_iv))
            res = await encryptFile(Inputfiles[0], await importAESKeyFromBase64(content_aes_key), content_iv)
            // console.log(res)

        }

        if(!res.content.ciphertext){
            console.log('ERR.: ABORT ')
            return
        }

        res.asset_name = content_Asset_name
        res.mimeType = content_MimeType
        res.allowed_roles = []
        res.wrapped_keys = []
        res.content = { 
            ...res.content,
            iv: content_iv,
        }

        for(const user of selectedUsers){
            if(user.stored_aes_key){
                //Create WKey:
                // - Choose random iv_wkey for later enc the content key
                const iv_wkey: string = create_random_iv()
                // - Encrypt the given content_aes_key with user.stored_aes_key and iv_wkey 
                const user_aes_key: CryptoKey = await importAESKeyFromBase64(user.stored_aes_key)
                const wKey_cipher: string = await encryptAESGCM256(content_aes_key, user_aes_key, base64ToBytes(iv_wkey))
                // - Save this as a Wrapped_Key res_wkeys.push (later in res.wrapped_keys)
                const wrapped_key: Wrapped_Key = {
                    role_id: user.id,
                    iv: iv_wkey,
                    wKey: wKey_cipher,
                }
                res.wrapped_keys.push(wrapped_key)
                res.allowed_roles.push(user.id)

            } else {
                console.log(`User has no stored AES Key:: user=${user}`)
                return
            }
        } 

        // output = JSON.stringify(res, null, 2)
        // const tmpciphertext: string = res.content.ciphertext
        // res.content.ciphertext = ''
        if(inputString){
            output = JSON.stringify(res, null, 2)
        } else {
            const output_obj: ProtectedAssets = {...res, content: {ciphertext: '', iv: res.content.iv}}
            output = JSON.stringify(output_obj, null, 2)
        }
        resulting_enc_obj = res
        // res.content.ciphertext = tmpciphertext
        return res
    } 


    function downloadFile(){
        if(resulting_enc_obj && resulting_enc_obj.asset_name){
            const buf: ArrayBuffer = base64ToArrayBuffer(resulting_enc_obj.content.ciphertext)
            downloadArrayBuffer(buf, resulting_enc_obj.asset_name)
        }
    }


    function toPlainArrayBuffer(buffer: ArrayBufferLike): ArrayBuffer {
        const plain = new ArrayBuffer(buffer.byteLength);
        new Uint8Array(plain).set(new Uint8Array(buffer));
        return plain;
    }

    function downloadArrayBuffer(buffer: ArrayBufferLike, filename: string, mime = "application/octet-stream") {
        const plainBuffer = toPlainArrayBuffer(buffer);

        const blob = new Blob([plainBuffer], { type: mime });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename + '.enc';
        document.body.appendChild(a);
        a.click();

        a.remove();
        URL.revokeObjectURL(url);
    }


    async function read_added_file() {
		const file = Inputfiles?.[0];

		if (!file) {
            content_Asset_name = ''
            content_MimeType = ''
			fileContent = null;
			return;
		}

		if (!list_of_Possible_MimeTypes.includes(file.type)) {
			console.error(`Unsupported file type: ${file.type}`);
			return;
		}

		content_MimeType = file.type;
		content_Asset_name = file.name;

		if (file.type.startsWith('text/') || file.type === 'application/json') {
			fileContent = await file.text();
		} else {
			fileContent = await file.arrayBuffer();
		}

		console.log('File name:', content_Asset_name);
		console.log('MIME type:', content_MimeType);
		console.log('Content:', fileContent);
	}


	function remove_added_file() {
		Inputfiles = null;
		fileContent = null;
		content_MimeType = '';
		content_Asset_name = '';
	}



    
    function refresh_frontend(){
        update_stored_user_list = true
    }


    $effect(()=>{
        if(update_stored_user_list){
            stored_userlist = get_only_stored_users()
            update_stored_user_list = false
        }
    })


    function check_completeness_of_input(): boolean{
        if(!content_aes_key || content_aes_key.replaceAll(' ', '').length === 0 || !content_iv || content_iv.replaceAll(' ', '').length === 0 || !(inputString || Inputfiles) || selectedUsers.length <= 0 || !content_Asset_name || !content_MimeType){
            return false
        }
        return true
    }

    $effect(()=>{
        if(content_Asset_name || content_MimeType || content_aes_key || content_iv || content_password || selectedUsers){
            content_is_complete = check_completeness_of_input()
        }
    })

    async function fileToBase64(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary);
    }

</script>

<div class="w-full h-full flex flex-col gap-x-2 p-3">
<!-- <button class="btn btn-error" onclick={log_input}>LOG Input</button> -->

    <p class="underline text-xl mb-3">Encyption Helper:</p>
    <div class="flex size-full gap-x-3">
        <div class="w-4/10 h-full flex flex-col">

            <!-- Selecting User -->
            <div class="flex flex-col w-full">
                <p>Select User:</p>
                {#if stored_userlist.length > 0}
                    <!-- <select class="select w-full bg-neutral-content text-neutral">
                        <option value="" selected disabled>Choose User</option>
                        {#each stored_userlist as user (user.id)}
                            <option value="">{user.username}</option>
                        {/each}
                    </select> -->
                    {#each stored_userlist as user (user)}
                    {@const selected: boolean = check_if_user_is_selected(user.id)}
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

                <label for="" class="flex items-center w-full gap-x-2 text-nowrap">
                    <p>Asset Name</p>
                    <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full" placeholder="Asset Name" bind:value={content_Asset_name}>
                </label>

                <select class="select w-full bg-neutral-content text-neutral" bind:value={content_MimeType}>
                    <option value="" selected disabled>Choose MimeType</option>
                    {#each list_of_Possible_MimeTypes as mt (mt)}
                        <option value="{mt}">{mt}</option>                        
                    {/each}
                </select>


                <label for="" class="flex items-center w-full h-full max-h-min gap-x-2 text-nowrap">
                    <p>Input</p>
                    <div class="divider divider-horizontal mx-0"></div>
                    <div class="flex flex-col w-full h-full max-h-min">
                        <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full h-full {Inputfiles && Inputfiles?.length > 0? '' : ''}" placeholder="Content Plaintext" bind:value={inputString} disabled={Inputfiles && Inputfiles?.length > 0}>
                        <div class="divider">or</div>
                        <div class="h-full max-h-min w-full flex gap-x-1">
                            <input type="file" class="bg-neutral-content text-neutral file-input w-full text-xs" bind:files={Inputfiles} disabled={inputString.length > 0} onchange={read_added_file}/>
                            <button class="btn btn-error w-fit h-full" aria-label="random iv" onclick={remove_added_file}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                    <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </label>

                <label for="" class="flex items-center w-full gap-x-2 text-nowrap">
                    <p>AES Key (b64)</p>
                    <input type="text" class="bg-neutral-content text-neutral input ml-auto w-full" placeholder="AES Key" bind:value={content_aes_key}>
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
                </label>

                <button class="btn btn-success {content_is_complete? '' : 'btn-disabled'}" onclick={encrypt_content_for_selected_users}>Encrypt</button>
            </div>
        </div>

        <div class="w-6/10 h-full flex flex-col">
            {#if content_MimeType === 'text/plain'}
            <!--  -->
            <textarea name="" id="" class="size-full text-black" bind:value={output} readonly></textarea>
            {:else}
            <button class="btn btn-info" onclick={downloadFile}>Download Enc File</button>
            <textarea name="" id="" class="size-full text-black" bind:value={output} readonly></textarea>
            {/if}
        </div>
    </div>
    
</div>