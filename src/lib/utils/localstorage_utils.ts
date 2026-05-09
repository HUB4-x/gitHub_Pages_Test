export function setLocalStorage<T>(key: string, value: T): void {
    try{
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.log('Error when setting storage' + e)
    }
}

// load object
export function getLocalStorage<T>(key: string): T | null {
    try{
        const item: string | null = localStorage.getItem(key);
        if (!item) return null;
    
        try {
            return JSON.parse(item) as T;
        } catch {
            return null;
        }
    } catch (e){
        console.log('Error when getting storage' + e)
        return null
    }
}

// remove
export function removeLocalStorage(key: string): void {
	localStorage.removeItem(key);
}


