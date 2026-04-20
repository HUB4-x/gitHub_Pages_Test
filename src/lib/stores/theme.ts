/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Utility functions and storage for the app's theme.
 */
import { writable } from "svelte/store"

const LIGHT_x_DARK_THEME: [string, string] = ['nord', 'business'] //maybe make this as an export var

const THEME_LOCAL_STORAGE_KEY: string = 'theme-portfolio-page'

export const currently_active_theme = writable<string>(LIGHT_x_DARK_THEME[0])
export const is_light_theme_active = writable<boolean>(true)

export function changeTheme() {
    const light_theme: string = LIGHT_x_DARK_THEME[0]
    const dark_theme: string = LIGHT_x_DARK_THEME[1]
    const current_theme: string = get_currently_active_theme()

    if(current_theme === LIGHT_x_DARK_THEME[0]){
        changeThemeVars(dark_theme, false)
    } else {
        changeThemeVars(light_theme, true)
    }
}


function changeThemeVars(theme_string: string, isLightTheme: boolean, localstorage_key_string: string = THEME_LOCAL_STORAGE_KEY){
    is_light_theme_active.set(isLightTheme)
    currently_active_theme.set(theme_string)
    document.documentElement.setAttribute('data-theme', theme_string);
    localStorage.setItem(localstorage_key_string, theme_string);
} 


export function get_currently_active_theme(): string{
    const current_theme: string = localStorage.getItem(THEME_LOCAL_STORAGE_KEY)?? LIGHT_x_DARK_THEME[0]
    return current_theme
}


export function check_light_theme_active(): boolean{
    const tmp_theme: string = get_currently_active_theme()
    if(tmp_theme === LIGHT_x_DARK_THEME[0]){
        return true
    }
    return false
}