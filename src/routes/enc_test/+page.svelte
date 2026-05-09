<script lang="ts">
	import { admin_user, base64ToBytes, deriveAESKeyFromPassword, exportAESKeyToBase64, list_of_Possible_MimeTypes , type ProtectedAssets, type Wrapped_Key } from "$lib/utils/AC_Controls";
	import { onMount } from "svelte";


    onMount(async ()=>{
        // console.log('IV_1:: ' + create_random_iv())
        // console.log('IV_2:: ' + create_random_iv())
        // console.log('Salt_1:: ' + create_random_salt())
        // console.log('Salt_2:: ' + create_random_salt())
        // console.log('RND Content_key:: ' + await exportAESKeyToBase64(await createRandomAES256Key()))
        // console.log(await encryptAESGCM256(secret_content_key_plain, await importAESKeyFromBase64(AES_KEY_USER_toCHECK), base64ToBytes(wkey_admin_forTheTestContent.iv)))
    })

    /**
     * IV_1:: dq9LnQYYtvHb/bXd
        IV_2:: ovpyEczhTt0qjr6F
        Salt_1 7Ka6Tcjh/cOo1xEtfNA82w==
        Salt_2 swovUSMgZOlZVUqd0wKtOA==
     */


    let secret_content_key_plain: string = $state('g6JdEQCmpmwCmcZBhpQkl+b+lrf9F+XrXcFSIVrsLk0=') //The corresponding iv is in the content asset (ProtectedAsset Obj)

    let wkey_admin_forTheTestContent: Wrapped_Key = $state({
        iv: 'dq9LnQYYtvHb/bXd',
        role_id: 0,
        salt: '7Ka6Tcjh/cOo1xEtfNA82w==',
        wKey: 'G7JgnPVZlRSb7dulUWR7F2njd9CP9loBI/NtIgd6qjH9H2xF+t6J1BiZF2j9fgDpdgbnyriu9Kc+GiAe' //The "ciphertext" that gets us the content key. i.e. Encrypted Content_Key
    })


    let protected_asset: ProtectedAssets = $state(
        {
            id: 82738,
            asset_name: '',
            allowed_roles: [admin_user],
            content: {
                iv: 'ovpyEczhTt0qjr6F',
                ciphertext: 'XXXXXXXXXXXXXXXXXXX', //This is ,,Hello World Encrpyted using the content key
            },
            mimeType: list_of_Possible_MimeTypes[1],
            wrapped_keys: [
                wkey_admin_forTheTestContent,
            ]
        }
    )


    // User_password (+user_salt) --> AES_KEY_USER = gen_key(user_password, user_salt)
    // --> Content_key = AES_Decrypt(Wkey_user_id, iv_Wkey, wkey_salt, key=AES_KEY_USER) 
    // --> Content = AES_Decrypt(Encrpyted_Content, iv_Content, content_salt, key=Content_key) 
    // let user_password: string = $state('ThreeLittleCatsSittingOnACouch')
    let user_password: string = $state(admin_user.stored_aes_key?? '')
    let AES_KEY_USER_toCHECK: string = 'd0mh70T2ENCUx5VOgzp+6z0AZEiVnFIjFCWDlaOrNxw='
    
    let aes_derived_user_key: string = $state('')
    let user_salt: string = $state(admin_user.salt?? '')


    let c_content: string = $state('')
    let p_content: string = $state('')
    


    async function deriveKey_Key(){
        aes_derived_user_key = await exportAESKeyToBase64(await deriveKey(user_password, user_salt))
    }

    function deriveKey(password: string, salt_b64: string){
        let derived_key = deriveAESKeyFromPassword(password, base64ToBytes(salt_b64))
        // console.log('Derived_Key:: ' + derived_key)
        return derived_key
    }


</script>

<div class="size-full flex flex-col">
    <div class="flex gap-x-3">
        <h1 class="text-5xl">AC TEST</h1>
        <button class="btn btn-success">Decrypt</button>
        <button class="btn btn-warning">Encrypt</button>
    </div>

    <div class="divider"></div>

    <label for="Content Key" class="flex text-nowrap">Content Key Plain
        <input type="text" name="Content Key" class="w-full text-black" placeholder="Content Key" bind:value={secret_content_key_plain}>
    </label>
    <label for="content_key_iv" class="flex text-nowrap">content_key_iv
        <input type="text" name="content_key_iv" class="w-full text-black" placeholder="content_key_iv" bind:value={protected_asset.content.iv}>
    </label>

    <div class="divider"></div>

    <label for="cenc" class="flex text-nowrap">Content Encrpyted
        <input type="text" name="cenc" class="w-full text-black" placeholder="Content Encrpyted" bind:value={c_content}>
    </label>

    <label for="cdec" class="flex text-nowrap">Content Decrypted
        <input type="text" name="cdec" class="w-full text-black" placeholder="Content Decrypted" bind:value={p_content}>
    </label>

    <div class="divider"></div>

    <label for="pp" class="flex text-nowrap">User Pass Phrase
        <input type="text" name="pp" class="w-full text-black" placeholder="Pass Phrase" bind:value={user_password}>
        <button class="btn btn-info" onclick={deriveKey_Key}>Derive</button>
    </label>
    <label for="us" class="flex text-nowrap">User Salt
        <input type="text" name="us" class="w-full text-black" placeholder="User Salt" bind:value={user_salt}>
    </label>
    <label for="kderv" class="flex text-nowrap">Derived Key
        <input type="text" name="kderv" class="w-full text-black" placeholder="Derived Key" bind:value={aes_derived_user_key}>
    </label>
    <label for="chekc" class="flex text-nowrap">Derived Key - CHECK
        <input type="text" name="chekc" class="w-full text-black" placeholder="Derived Key" bind:value={AES_KEY_USER_toCHECK}>
    </label>

    <div class="flex flex-col w-full h-100 mt-auto border-2 border-neutral-content p-2 rounded-xl">
        <p class="text-lg font-bold underline">Rendered Content:</p>
    </div>
</div>