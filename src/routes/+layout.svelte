<script lang="ts">
	/* eslint-disable @typescript-eslint/no-unused-vars */

	/**
	 * GitHub pages tutorial: https://github.com/shinokada/sveltekit-githubpages/tree/main
	*/
	import './layout.css';
	// import favicon from '$lib/assets/favicon.svg';
	import favicon from '$lib/assets/favicon.png';
	import logo_light from '$lib/assets/h-dev-clean_lightlogo_wo_bg.png'
	import logo_dark from '$lib/assets/h-dev-clean_darklogo_wo_bg.png'

	import { resolve } from '$app/paths';
	import { changeTheme, get_currently_active_theme, is_light_theme_active } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { available_users, init_userSession, load_storage_userlist_into_memory } from '$lib/stores/user_session';
	import { getLocalStorage } from '$lib/utils/localstorage_utils';
	import { USER_LOCALSTORAGE_KEY } from '$lib/utils/AC_Controls';
	import { open_modal } from '$lib/utils/ui_utils';
	import LoginComponent from '$lib/components/login_component.svelte';

	let { children } = $props();

	let isLightTheme: boolean = $state(true)


	onMount(()=>{
		// TESTING
		openCredsPopUp()
		// Testing ende

		get_currently_active_theme()
		isLightTheme = $is_light_theme_active
		if(!getLocalStorage(USER_LOCALSTORAGE_KEY)){
			init_userSession()
		} 
		load_storage_userlist_into_memory()
	})

	$effect(()=>{
		isLightTheme = $is_light_theme_active
	})

	function openCredsPopUp(){
		open_modal('login_modal')
	}


</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<!-- <div class="w-screen h-screen bg-base overflow-hidden flex flex-col"> -->
<div class="w-screen h-screen flex flex-col bg-gradient-to-br from-base to-secondary/10 overflow-hidden min-w-[280px]">
	<!-- <nav class="flex w-full h-fit px-2 pt-4 min-w-max">
		<div class="size-full flex">
			<div class="w-full h-fit flex place-content-center gap-x-4">
				<a href="{resolve('/')}" class="link {isLightTheme? 'link-info' : 'link-secondary'} text-lg font-bold transition-transform duration-200 hover:scale-105">About Me</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">CV</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Blog</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Projects</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Repositories</a>
			</div>
		</div>

		<div class="flex w-fit h-fit gap-x-3">
			<button class="btn btn-info">Enter Password</button>
	
			<label class="swap swap-rotate">
				<input type="checkbox" class="theme-controller hidden" bind:checked={isLightTheme} onclick={changeTheme}/>
	
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-on h-10 w-10 fill-current">
					<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
				</svg>
	
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-off h-10 w-10 fill-current">
					<path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
				</svg>
			</label>
		</div>
	</nav> -->

	<nav class="navbar min-w-max gap-x-3">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
					 <!-- <img src="{favicon}" alt="Favicon Logo"> -->
				</div>
				<ul tabindex="-1" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
					<li><a href="{resolve('/')}" class="link {isLightTheme? 'link-info' : 'link-secondary'} text-lg font-bold transition-transform duration-200 hover:scale-105">About Me</a></li>
					<li><a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">CV</a></li>
					<li><a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Blog</a></li>
					<li><a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Projects</a></li>
					<li><a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Repositories</a></li>
					<li><button class="btn btn-sm bg-info/20 border-0 hover:bg-info" onclick={openCredsPopUp}>Enter Credentials</button></li>
				</ul>
			</div>
			<!-- <a class="btn btn-ghost text-xl">daisyUI</a> -->
			<a class="btn text-xl h-full bg-transparent border-0 hover:border-1 hover:bg-base-100 w-22 md:w-30" href="{resolve('/')}">
				<img src="{$is_light_theme_active? logo_dark : logo_light}" alt="Favicon Logo" class="h-fit w-fit">
			</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1 gap-x-3">
				<!-- <li>
					<details>
					<summary>Parent</summary>
					<ul class="p-2 bg-base-100 w-40 z-1">
						<li><a>Submenu 1</a></li>
						<li><a>Submenu 2</a></li>
					</ul>
					</details>
				</li> -->
				<a href="{resolve('/')}" class="link {isLightTheme? 'link-info' : 'link-secondary'} text-lg font-bold transition-transform duration-200 hover:scale-105 hover:text-info">About Me</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">CV</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Blog</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Projects</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Repositories</a>
			</ul>
		</div>
		<div class="navbar-end gap-x-3">
			<button class="btn bg-info/50 border-0 hover:bg-info hidden lg:inline" onclick={openCredsPopUp}>Enter Credentials</button>
			<label class="swap swap-rotate">
				<input type="checkbox" class="theme-controller hidden" bind:checked={isLightTheme} onclick={changeTheme}/>
	
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-on h-10 w-10 fill-current">
					<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
				</svg>
	
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-off h-10 w-10 fill-current">
					<path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
				</svg>
			</label>
		</div>
	</nav>


	<div class="divider m-0"></div>

	<div class="flex min-h-0 min-w-max grow w-full overflow-y-auto overflow-x-hidden">
		<div class="w-full h-full p-2 md:p-0 md:w-6/8 mx-auto text-lg font-medium overflow-x-hidden">
			{@render children()}
		</div>
	</div>
</div>


<LoginComponent></LoginComponent>

