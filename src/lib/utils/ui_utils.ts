/**
 * Opens a daisyUI modal by its HTML dialog ID.
 *
 * Optionally closes the modal automatically after a given amount of time.
 *
 * @param modal_name - The `id` attribute of the `<dialog>` element to open.
 * @param auto_close_after_ms - Optional time in milliseconds after which the modal should close automatically.
 *
 * @example
 * open_modal('delete_user_modal');
 *
 * @example
 * open_modal('success_modal', 2000); // closes after 2 seconds
 */
export function open_modal(modal_name: string, auto_close_after_ms?: number) {
	const modal = document.getElementById(modal_name) as HTMLDialogElement | null;

	if (!modal) {
		console.error(`Modal not found: ${modal_name}`);
		return;
	}

	modal.showModal();

	if (auto_close_after_ms && auto_close_after_ms > 0) {
		setTimeout(() => {
			close_modal(modal_name);
		}, auto_close_after_ms);
	}
}

/**
 * Closes a daisyUI modal by its HTML dialog ID.
 *
 * @param modal_name - The `id` attribute of the `<dialog>` element to close.
 *
 * @example
 * close_modal('delete_user_modal');
 */
export function close_modal(modal_name: string) {
	const modal = document.getElementById(modal_name) as HTMLDialogElement | null;

	if (!modal) {
		console.error(`Modal not found: ${modal_name}`);
		return;
	}

	modal.close();
}