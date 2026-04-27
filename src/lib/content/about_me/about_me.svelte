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

<svelte:head>
	<title>About Me</title>
</svelte:head>

<div class="flex flex-col size-full overflow-auto">
    <div class="mockup-code w-full mx-auto select-none">
        <pre data-prefix=">" class="text-5xl"><code class="">{displayedText}</code></pre>
    </div>
    
    <div class="flex flex-col mt-5 size-full">
        <h1 class="text-2xl">Hello Reader</h1>
    </div>
</div>