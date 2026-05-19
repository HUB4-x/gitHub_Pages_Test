/**
 * 
 */

import { get_only_stored_users } from "$lib/stores/user_session";
import { setLocalStorage } from "./localstorage_utils";

export const STORED_CREDENTIALS_LOCALSTORAGE_KEY: string = ''

export const settings = {
    passwordKdf: {
		name: 'PBKDF2',
		hash: 'SHA-256',
		iterations: 1_000_000,
		saltLength: 16
	},

	contentEncryption: {
		name: 'AES-GCM',
		keyLength: 256,
		ivLength: 16
	},

	keyWrapping: {
		name: 'AES-GCM',
		keyLength: 256,
		ivLength: 16
	}
}


/**
 * For every asset we have a list of roles that are allowed to access it (just for a quick lookup).
 * Then we have either the data directly as an encrypted string (for small data) or a path to the data or a pointer to the file (like a hndler).
 * Then we have a list of the content_key (the key with which the content was encrypted) and 
 */
export type ProtectedAssets = {
    id?: number
    asset_name?: string; //name for the asset
	allowed_roles: number[]; //Who can access it. No Sec/AC function but just for quick lookup

    mimeType: Possible_MimeTypes; //What is the type of the content

    //encrpyted content
	content: {
        iv: string //base64 iv string for enc-/decryption of the content/ciphertext. DEC(SECRET_AES_CONTENT_KEY, iv, ciphertext) ==> content
        ciphertext: string //Encrypted content (=ciphertext),
		plaintext?: string //The decrypted content ciphertext after its decrypted clientside
    },

    wrapped_keys: Wrapped_Key[]; //The list of wrapped keys
};


export type Wrapped_Key = {
	role_id: number;
	iv: string; //base64, for AES-GCM wrapping. The DEC(user.stored_aes_key, iv, wKey) ==> SECRET_AES_CONTENT_KEY
	wKey: string //base64, Encrypted Key for the role to decrpyt the encrypted content
	salt?: string; //base64, for PBKDF2; The salt it is Encrypted with //???????????????????????????
}


export const list_of_Possible_MimeTypes = [
	// text
	'text/plain','text/markdown','text/html','text/csv','application/json',
	// images
	'image/jpeg','image/png',
]
// export const list_of_Possible_MimeTypes = [
// 	// documents
// 	'application/pdf',
// 	// text
// 	'text/plain','text/markdown','text/html','text/csv','application/json',
// 	// images
// 	'image/jpeg','image/png',
// 	// video
// 	'video/mp4','video/webm',
// 	// audio
// 	'audio/mpeg','audio/wav',
// 	// archives
// 	'application/zip',
// ]

export type Possible_MimeTypes = typeof list_of_Possible_MimeTypes[number]




export function create_random_iv(){
	const iv = crypto.getRandomValues(new Uint8Array(settings.contentEncryption.ivLength));
	return bytesToBase64__small_data(iv)
}

export function create_random_salt(){
	const salt = crypto.getRandomValues(new Uint8Array(settings.contentEncryption.ivLength));
	return bytesToBase64__small_data(salt)
}

// export function create_random_content_key(){
// 	const contentKey = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = 256 bits
// 	return bytesToBase64__small_data(contentKey)
// }


export function bytesToBase64__small_data(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

export function bytesToBase64__large_data(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

export function base64ToBytes(base64: string): BufferSource {
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return buffer;
}




// ################################################################################
// ############################## AES Functions ###################################
// ################################################################################


export async function createRandomAES256Key(): Promise<CryptoKey> {
	return crypto.subtle.generateKey(
		{
			name: 'AES-GCM',
			length: settings.contentEncryption.keyLength
		},
		true,
		['encrypt', 'decrypt']
	);
}

export async function exportAESKeyToBase64(key: CryptoKey): Promise<string> {
	const raw = await crypto.subtle.exportKey('raw', key);
	return bytesToBase64__small_data(new Uint8Array(raw));
}

export async function importAESKeyFromBase64(keyBase64: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		'raw',
		base64ToBytes(keyBase64),
		{ name: 'AES-GCM' },
		true,
		['encrypt', 'decrypt']
	);
}


export async function encryptAESGCM256(
	plaintext: string,
	key: CryptoKey,
	iv: BufferSource
): Promise<string> {

	const encrypted = await crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv
		},
		key,
		new TextEncoder().encode(plaintext)
	);

	return bytesToBase64__large_data(new Uint8Array(encrypted))
}


export async function decryptAESGCM256(
	ciphertextBase64: string,
	key: CryptoKey,
	iv: BufferSource,
): Promise<string> {
	const decrypted = await crypto.subtle.decrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		key,
		base64ToBytes(ciphertextBase64)
	);

	return new TextDecoder().decode(decrypted);
}


export async function decryptFile(enc_buf: ArrayBuffer, key: CryptoKey, iv: BufferSource, mimeType: string) {
//   const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    enc_buf
  );

  return new Blob([decrypted], { type: mimeType });
}

export async function encryptFile(file: File, key: CryptoKey, ivBase64?: string): Promise<ProtectedAssets> {
	let iv = base64ToBytes(create_random_iv())
	if(ivBase64){
		iv = base64ToBytes(ivBase64)
	} 

	const plaintext = await file.arrayBuffer();

	const ciphertext = await crypto.subtle.encrypt(
		{
		name: "AES-GCM",
		iv
		},
		key,
		plaintext
	);

	const res: ProtectedAssets = {
		content: {
			ciphertext: arrayBufferToBase64(ciphertext),
			iv: bufferSourceToString(iv),
		},
		mimeType: file.type,
		asset_name: file.name,
		allowed_roles: [],
		wrapped_keys: [], 
	}
	return res
}

function bufferSourceToString(source: BufferSource): string {
  const bytes =
    source instanceof ArrayBuffer
      ? new Uint8Array(source)
      : new Uint8Array(source.buffer, source.byteOffset, source.byteLength);

  return new TextDecoder("utf-8").decode(bytes);
}



// ################################################################################
// ############################## PBKDF2 Functions ################################
// ################################################################################

export async function deriveAESKeyFromPassword(password: string, salt: BufferSource, iterations = settings.passwordKdf.iterations): Promise<CryptoKey> {
	const encoder = new TextEncoder();

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false, //Extractable 
		['deriveKey']
	);

	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations,
			hash: 'SHA-256'
		},
		keyMaterial,
		{
			name: 'AES-GCM',
			length: 256
		},
		true, //Extractable
		['encrypt', 'decrypt']
	);
}





// ################################################
// ############### USER LIST ######################
// ################################################

export const USER_LOCALSTORAGE_KEY: string = 'Stored_User_Creds'
export const isFreeUser_Storage_Key: string = 'NOLOGIN_FU_ACK'

export type Access_Control_Role_Type = {
    id: number; //Unique identifier
    username: string; //Username as a user-friendly id
    idx?: number; //????
	salt: string; //salt encoded as base64. Is used to deriveAESKey from Password with PBKDF2 function
    stored_aes_key?: string; //The AES Key encoded as base64
}

export const admin_user: Access_Control_Role_Type = {
		id: 0,
		idx: 0,
		username: 'Admin',
		stored_aes_key: '',
		salt: 'wBYEnwjR2fhMRTZ9vmk9Kw==',
}
export const test_user01: Access_Control_Role_Type = {
		id: 42,
		idx: 1,
		username: 'Test User',
		stored_aes_key: '',
		salt: '66trSgAx9+b3bccdSNgJ1A==',
}
export const test_user02: Access_Control_Role_Type = {
		id: 43,
		idx: 1,
		username: 'Test User02',
		stored_aes_key: '',
		salt: '66trSgAx9+b3bccdSNgJ1A==',
}
export const test_user03: Access_Control_Role_Type = {
		id: 44,
		idx: 1,
		username: 'Test User03',
		stored_aes_key: '',
		salt: '66trSgAx9+b3bccdSNgJ1A==',
}
export const test_user04: Access_Control_Role_Type = {
		id: 45,
		idx: 1,
		username: 'Test User04',
		stored_aes_key: '',
		salt: '66trSgAx9+b3bccdSNgJ1A==',
}

// ###################################################################
// ###################################################################
// ###################################################################
export const admin_test: Access_Control_Role_Type = {
	id: 0,
	idx: 0,
	username: 'Admin Test',
	stored_aes_key: '',
	salt: 'wBYEnwjR2fhMRTZ9vmk9Kw==',
}
export const test_user: Access_Control_Role_Type = {
	id: 100,
	idx: 999,
	username: 'T-User',
	stored_aes_key: '',
	salt: '67trSgAx8+b3bxxdSNgJ1A==',
}

export const recruiter_test: Access_Control_Role_Type = {
	id: 1,
	idx: 1,
	username: 'Recruiter Test',
	stored_aes_key: '',
	salt: '66trSgAx9+b3bccdSNgJ1A==',
}
// ###################################################################
// ###################################################################
// ###################################################################


export const default_user_list: Access_Control_Role_Type[] = [admin_test, recruiter_test, test_user] as const
// export const default_user_list: Access_Control_Role_Type[] = [admin_user, test_user01, test_user02, test_user03, test_user04] as const

export type USER_LIST = typeof default_user_list[number]

export function init_user_storage_with_default_values(default_list: Access_Control_Role_Type[] = default_user_list){
	console.log('Init Local Storage with default values')
    setLocalStorage(USER_LOCALSTORAGE_KEY, default_list)
}


export function updateUserById<T extends { id: number | string }>(user_id: T['id'], updates: Partial<T>): T[] | null {
	const raw = localStorage.getItem(USER_LOCALSTORAGE_KEY);
	if (!raw) return null;

	try {
		const users = JSON.parse(raw) as T[];

		const updatedUsers = users.map((user) =>
			user.id === user_id ? { ...user, ...updates } : user
		);

		localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(updatedUsers));
		return updatedUsers;
	} catch {
		return null;
	}
}

export function updateUserByUsername<T extends { username: number | string }>(username: T['username'], updates: Partial<T>): T[] | null {
	const raw = localStorage.getItem(USER_LOCALSTORAGE_KEY);
	if (!raw) return null;

	try {
		const users = JSON.parse(raw) as T[];

		const updatedUsers = users.map((user) =>
			user.username === username ? { ...user, ...updates } : user
		);

		localStorage.setItem(USER_LOCALSTORAGE_KEY, JSON.stringify(updatedUsers));
		return updatedUsers;
	} catch {
		return null;
	}
}


export function remove_user_from_stored_userlist(id: number){
	const user_default_values: Access_Control_Role_Type | undefined = default_user_list.find((u: Access_Control_Role_Type)=>{
		if(u.id === id) return u
	});
	if(user_default_values){
		updateUserById(id, user_default_values)
	}
}


export function get_user_from_default_userlist(id?: number, username?: string): Access_Control_Role_Type | undefined{
	const userlist: Access_Control_Role_Type[] = default_user_list
	const user: Access_Control_Role_Type | undefined = userlist.find((user)=>{
		if(id){
			if(user.id === id){
				return user
			}
		} else if (username) {
			if(user.username === username) { 
				return user
			}
		} 
	})
	if(user){
		return user
	} else {
		return undefined
	}
}
export function get_user_from_stored_userlist(id?: number, username?: string): Access_Control_Role_Type | undefined{
	const userlist: Access_Control_Role_Type[] = get_only_stored_users()
	const user: Access_Control_Role_Type | undefined = userlist.find((user)=>{
		if(id){
			if(user.id === id){
				return user
			}
		} else if (username) {
			if(user.username === username) { 
				return user
			}
		} 
	})
	if(user){
		return user
	} else {
		return undefined
	}
}





// ################################################
// ################################################
// ################################################