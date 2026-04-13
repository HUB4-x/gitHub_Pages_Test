<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status} - Page not found</title>
</svelte:head>

<div class="min-h-screen flex place-items-center">
  <div class="text-center m-auto">
    <h1 class="text-4xl font-bold">{page.status}</h1>
    <p class="mt-2">{page.error?.message ?? 'Page not found'}</p>
  </div>
</div>