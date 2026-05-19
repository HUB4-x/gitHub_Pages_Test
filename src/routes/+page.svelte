<svelte:head>
    <title>About Me</title>
</svelte:head>


<script lang="ts">
	import { onMount } from 'svelte';
	import { runTypewriterIteration } from '$lib/utils/typewriter_effect';
	import { resolve } from '$app/paths'; 
	import { get_only_stored_users, getHighestPrivUser, init_userSession } from '$lib/stores/user_session';
	import type { Access_Control_Role_Type } from '$lib/utils/AC_Controls';


	const hello_user_text: string = 'Hello dear $username$, \nWelcome to my Portfolio! Feel free to take a look around.'
	let text: string = $state('');
	let displaytext: string = $state('');

	const typingSpeed: number = $state(35);
	const holdTime: number = $state(7000);
	const restartDelay: number = $state(200);

	let mounted: boolean = $state(true);

	async function start_typewrite_animation() {
		init_userSession()
		const available_users: Access_Control_Role_Type[] = get_only_stored_users()
		text = hello_user_text.replace('$username$', 'Stranger')
		if(available_users.length > 0){
			const current_highestUser: Access_Control_Role_Type | null = getHighestPrivUser(available_users)
			if(current_highestUser){
				text = hello_user_text.replace('$username$', current_highestUser.username)
			}
		}
		while (mounted) {
			await runTypewriterIteration({
				text,
				typingSpeed,
				holdTime,
				restartDelay,
				onUpdate: (value) => {displaytext = value},
				shouldContinue: () => mounted
			});
		}
	}

	onMount(() => {
		start_typewrite_animation();

		return () => {
			mounted = false;
		};
	});


	

</script>

<div class="h-full w-full max-w-full min-w-0 overflow-hidden lg:w-[90%] lg:mx-auto flex flex-col">
	<div class="mockup-code w-full max-w-[calc(100vw-1rem)] min-w-0 h-fit mx-auto select-none overflow-hidden bg-neutral-content text-neutral dark:bg-base-200 dark:text-neutral-content">
		<div class="grid w-full min-w-0 max-w-full grid-cols-[1.25rem_minmax(0,1fr)] px-4 py-1 pb-4 text-base sm:text-lg md:text-xl lg:text-2xl">
			<span class="text-right select-none">&gt;</span>
			<!-- <span class="block min-w-0 max-w-full whitespace-normal break-words [overflow-wrap:anywhere] pl-2">
				{displaytext}
			</span> -->
			<span class="block min-w-0 max-w-full whitespace-pre-line wrap-break-word pl-2">
				{displaytext}
			</span>
		</div>
	</div>
	

	<div class="flex flex-col min-w-max mx-auto mt-5 h-full w-full">
		<a href={resolve('/enc_test')}>TEST PAGE</a>
		<a href={resolve('/tools/enc_content')}>Enc Content</a>
		<a href={resolve('/tools/dec_content')}>Dec Content</a>
		<a href={resolve('/t_route')}>Testing Content</a>
	</div>
</div>