<script lang="ts">
	import { resolve } from "$app/paths";
	import { changeTheme, currently_active_theme } from "$lib/stores/theme";

    

    // console.log('Hello World')
</script>

<h1>Welcome to my profile page!</h1>
<a class="btn btn-secondary" href="{resolve('/')}">HOME</a>
<button class="btn btn-warning" onclick={changeTheme}>Change Theme</button>
<button class="btn btn-warning" onclick={()=>{console.log($currently_active_theme)}}>LOG</button>
