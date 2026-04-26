<script lang="ts">
	import { onMount } from 'svelte';
	import { runTypewriterIteration } from '$lib/utils/typewriter_effect';
	import { data } from './landing_page_data';

	let text: string = $state(data.welcome_text);

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
		start_typewrite_animation();

		return () => {
			mounted = false;
		};
	});

</script>

<svelte:head>
	<title>{data.tab_title}</title>
</svelte:head>

<div class="size-full flex flex-col">
	<!-- <h1 class="text-3xl font-extrabold">Hi, my name is XYZ AAAA</h1> -->
	<div class="mockup-code w-fit mx-auto select-none">
		<pre data-prefix=">" class="text-5xl invisible"><code class="">{text}</code></pre>
		<pre data-prefix=">" class="text-5xl"><code class="">{displayedText}</code></pre>
	</div>
</div>
