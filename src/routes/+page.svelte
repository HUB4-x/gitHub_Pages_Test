<svelte:head>
    <title>About Me</title>
</svelte:head>


<script lang="ts">
	import { onMount } from 'svelte';
	import { runTypewriterIteration } from '$lib/utils/typewriter_effect';

	let text: string = $state('Welcome to My Portfolio!');

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


<div class="h-full w-full flex flex-col">
	<div class="w-full h-50 flex">
		<div class="mockup-code w-full h-fit mx-auto select-none">
			<pre data-prefix=">" class="text-5xl"><code class="">{displayedText}</code></pre>
		</div>
	</div>
    
    <div class="flex flex-col mt-5 h-full w-full">
        
    </div>
</div>