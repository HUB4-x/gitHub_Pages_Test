<script lang="ts">
	/**
	 * GitHub pages tutorial: https://github.com/shinokada/sveltekit-githubpages/tree/main
	*/
	import './layout.css';
	// import favicon from '$lib/assets/favicon.svg';
	import favicon from '$lib/assets/favicon.png';
	import { resolve } from '$app/paths';
	import { changeTheme, get_currently_active_theme, is_light_theme_active } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	let isLightTheme: boolean = $state(true)


	onMount(()=>{
		get_currently_active_theme()
		isLightTheme = $is_light_theme_active
	})

	$effect(()=>{
		isLightTheme = $is_light_theme_active
	})


</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<!-- <div class="w-screen h-screen bg-base overflow-hidden flex flex-col"> -->
<div class="w-screen h-screen flex flex-col bg-gradient-to-br from-base to-secondary/50 overflow-hidden">
	<nav class="flex w-full h-fit px-2 pt-4">
		<div class="size-full flex mx-10">
			<div class="w-full h-fit flex place-content-center gap-x-4">
				<a href="{resolve('/')}" class="link {isLightTheme? 'link-info' : 'link-secondary'} text-lg font-bold transition-transform duration-200 hover:scale-105">About Me</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">CV</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Blog</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Projects</a>
				<a href="{resolve('/')}" class="link-hover text-lg font-bold transition-transform duration-200 hover:scale-105">Repositories</a>
			</div>
		</div>
		<label class="swap swap-rotate">
			<!-- this hidden checkbox controls the state -->
			<input type="checkbox" class="theme-controller hidden" bind:checked={isLightTheme} onclick={changeTheme}/>

			<!-- sun icon -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-on h-10 w-10 fill-current">
				<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
			</svg>

			<!-- moon icon -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="swap-off h-10 w-10 fill-current">
				<path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clip-rule="evenodd" />
			</svg>

		</label>
	</nav>

	<div class="divider m-0"></div>

	<div class="flex min-h-0 grow w-full overflow-auto pt-5">
		<div class="w-5/8 h-full mx-auto text-lg font-medium pb-10">
			{@render children()}
		</div>
	</div>
</div>



