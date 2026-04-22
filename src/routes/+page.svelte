<script lang="ts">
	import { onMount } from 'svelte';
	import { runTypewriterIteration } from '$lib/utils/typewriter_effect';

	// const name_b64: string = 'SmFuIEh1YmVy'
	let text: string = $state('Welcome to my Portfolio!');

	const typingSpeed: number = $state(50);
	const holdTime: number = $state(5000);
	const restartDelay: number = $state(500);

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
		start_typewrite_animation();

		return () => {
			mounted = false;
		};
	});

</script>


<div class="size-full flex flex-col">
	<!-- <h1 class="text-3xl font-extrabold">Hi, my name is XYZ AAAA</h1> -->
	 <div class="mockup-code w-full">
		<pre data-prefix=">" class="text-6xl"><code class="">{displayedText}</code></pre>
	</div>
</div>
