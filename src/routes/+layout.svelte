<script lang="ts">
	import './layout.css';
	// import favicon from '$lib/assets/favicon.svg';
	import favicon from '$lib/assets/favicon.png';


	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<div class="w-screen h-screen bg-base overflow-hidden">
	<nav class="border-b-3 border-white">
		<button class="btn btn-info">Home</button>
	</nav>
	{@render children()}
</div>



