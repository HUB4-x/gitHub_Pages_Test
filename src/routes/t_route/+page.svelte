<script lang="ts">
	import { base64ToBytes, decryptAESGCM256, get_user_from_stored_userlist, importAESKeyFromBase64, type Access_Control_Role_Type, type ProtectedAssets, type Wrapped_Key } from "$lib/utils/AC_Controls";
	import { onMount, tick } from "svelte";

    let text_test: ProtectedAssets = $state({
        "asset_name": "T-Text",
        "mimeType": "text/plain",
        "allowed_roles": [
            100
        ],
        "wrapped_keys": [
            {
            "role_id": 100,
            "iv": "ns/pInv781HDEYQlG53z3Q==",
            "wKey": "tWO7g03ivcWOWB7du6NLjd/9DvHp8J5XZHxc76n7CjyuKM30/noORf7dHpJxYc+S5NCcEs/7k93nHwUY"
            }
        ],
        "content": {
            "iv": "2qkNjhj5HsB4xxAFyV0gHw==",
            "ciphertext": "43IFFUbegWLYdOxhlclfT6MEyeawMsFTMScenO0d"
        }
    })






    onMount(async ()=>{
        await tick()
        const t = await decrypt4User(text_test)
        text_test.content.plaintext = t
    })





    // async function loadFile(path: string): Promise<string> {
	// 	const res = await fetch(path);

	// 	if (!res.ok) {
	// 		throw new Error('Failed to load file');
	// 	}

	// 	return await res.text();
	// }



    export async function decrypt4User(content: ProtectedAssets): Promise<string | undefined>{
        const dec_user: Access_Control_Role_Type | undefined = get_user_from_stored_userlist(content.allowed_roles.find((user_id)=>{
            const tmp_user: Access_Control_Role_Type | undefined = get_user_from_stored_userlist(user_id)
            if(tmp_user){
                return tmp_user
            }
        }))
        if(dec_user){
            return decrypt_content_for_selected_users(content, dec_user)
        }
        return undefined
    }


    function findSuitableWrappedKey(user: Access_Control_Role_Type, wkeys: Wrapped_Key[]): Wrapped_Key | undefined {
        const res_wkey: Wrapped_Key | undefined = wkeys.find((key: Wrapped_Key)=>{
            if(key.role_id === user.id) return key
        })
        return res_wkey
    }



    async function decrypt_content_for_selected_users(content: ProtectedAssets, selected_user: Access_Control_Role_Type): Promise<string | undefined>{
        // const content: ProtectedAssets = JSON.parse(content)
        if(selected_user && content.wrapped_keys.length > 0){
            const suitable_wkey: Wrapped_Key | undefined = findSuitableWrappedKey(selected_user, content.wrapped_keys) 
            if(suitable_wkey && selected_user.stored_aes_key){
                const user_aes_key: CryptoKey = await importAESKeyFromBase64(selected_user.stored_aes_key)
                const iv_wkey: BufferSource = base64ToBytes(suitable_wkey.iv)
                // console.log(suitable_wkey, selected_user.stored_aes_key)

                
                let decrpyted_content_key: string = await decryptAESGCM256(suitable_wkey.wKey, user_aes_key, iv_wkey)
                let plaintext: string = await decryptAESGCM256(content.content.ciphertext, await importAESKeyFromBase64(decrpyted_content_key), base64ToBytes(content.content.iv))
                return plaintext

            } else {
                console.log('ERR:: Either selected_user has no stored aes key OR there are no suitable wrapped keys found ==> i.e the selected_user has no access rights to this asset')
            }
        } else {
            console.log('ERR:: Either no User selected OR there are no wrapped keys in the input object')
        }
        return undefined
    } 
</script>

<div class="size-full flex flex-col">
    <h1 class="text-3xl font-bold">Testing Page:</h1>
    {#if text_test.content.plaintext}
    <p>{text_test.content.plaintext}</p>
    {:else}
    <p>NOT DECRYPTED YET!</p>
    {/if}
    
    <!-- {#if bild_test.content.plaintext}
    <img src="data:image/jpg;base64,{bild_test.content.plaintext}" alt="">
    {:else}
    <p>NOT DECRYPTED YET!</p>
    {/if} -->

</div>