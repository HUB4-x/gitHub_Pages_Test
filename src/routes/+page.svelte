<script lang="ts">
	import { onMount } from 'svelte';
	import { runTypewriterIteration } from '$lib/utils/typewriter_effect';
	import { control_structure, data } from './landing_page_data';
	import { decode_base64 } from './tools/tool_functions';

	let text: string = $state('');

	const typingSpeed: number = $state(60);
	const holdTime: number = $state(7000);
	const restartDelay: number = $state(200);

	let displayedText: string = $state('');
	let mounted: boolean = $state(true);

	async function start_typewrite_animation() {
		while (mounted) {
			await runTypewriterIteration({
				text,
				typingSpeed,
				holdTime,
				restartDelay,
				onUpdate: (value) => {displayedText = value},
				shouldContinue: () => mounted
			});
		}
	}

	onMount(() => {
		// text = atob(name_b64) + ',\n' + text
		let tmp_string: string = data.welcome_text
		const rounds: number = control_structure.iteration_of_nested_b64
		for(let i = 0; i < rounds; i++){
			tmp_string = decode_base64(tmp_string)
		}
		text = tmp_string
		start_typewrite_animation();

		return () => {
			mounted = false;
		};
	});

</script>

<svelte:head>
	<title></title>
</svelte:head>

<div class="size-full flex flex-col">
	<!-- <h1 class="text-3xl font-extrabold">Hi, my name is XYZ AAAA</h1> -->
	 <div class="mockup-code w-fit mx-auto">
		<pre data-prefix=">" class="text-5xl invisible"><code class="">{text}</code></pre>
		<pre data-prefix=">" class="text-5xl"><code class="">{displayedText}</code></pre>
	</div>
</div>
