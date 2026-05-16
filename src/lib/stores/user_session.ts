/* eslint-disable @typescript-eslint/no-unused-vars */
import { default_user_list, init_user_storage_with_default_values, USER_LOCALSTORAGE_KEY, type Access_Control_Role_Type } from "$lib/utils/AC_Controls";
import { getLocalStorage, setLocalStorage } from "$lib/utils/localstorage_utils";
import { get, writable } from "svelte/store";




export const available_users = writable<Access_Control_Role_Type[]>([] as Access_Control_Role_Type[])



export function init_userSession(){
    // console.log('Init user session')

    //Check if local storage of user exists?
    // const user_storage: Access_Control_Role_Type[] | null = null
    const user_storage: Access_Control_Role_Type[] | null = getLocalStorage(USER_LOCALSTORAGE_KEY)
    if(!user_storage){
        //If no init this store with default values
        init_user_storage_with_default_values(default_user_list)
    }
    
    //if yes: load them into mempory as available_users
    load_storage_userlist_into_memory()

}

export function load_storage_userlist_into_memory(){
    // console.log('Loading Storage into Mem')
    const user_storage: Access_Control_Role_Type[] | null = getLocalStorage(USER_LOCALSTORAGE_KEY)
    if(user_storage){
        available_users.set(user_storage)
        // console.log(user_storage)
    }
}

// export function update_storage_userlist_from_memory(){
//     setLocalStorage(USER_LOCALSTORAGE_KEY, available_users)
// }


export function get_only_stored_users(): Access_Control_Role_Type[]{
    // console.log('only stored users are retrieved')
    // const user_storage_list: Access_Control_Role_Type[] | null = getLocalStorage(USER_LOCALSTORAGE_KEY)
    const user_storage_list: Access_Control_Role_Type[] = get(available_users)
    if(user_storage_list){
        const list: Access_Control_Role_Type[] = []
        user_storage_list.forEach((user: Access_Control_Role_Type)=>{
            if(user.stored_aes_key){
                list.push(user)
            }
        })
        // console.log(list)
        return list
    }
    return []
}


export function getHighestPrivUser(userlist: Access_Control_Role_Type[]): Access_Control_Role_Type | null{
    // const userlist: Access_Control_Role_Type[] = get_only_stored_users()
    if(userlist.length > 0){
        let highestPrivUser: Access_Control_Role_Type = {id:999, username: 'Err', salt: 'Err'} as Access_Control_Role_Type
        userlist.forEach((user: Access_Control_Role_Type)=>{
            if(user.id < highestPrivUser.id) {
                highestPrivUser = user
                return
            }
        })
        if(highestPrivUser.id !== 999){
            return highestPrivUser
        } else {
            //invalid users
            return null
        }
    } else {
        return null
    }
}

