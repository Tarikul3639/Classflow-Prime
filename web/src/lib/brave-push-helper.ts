// Detects if the current browser is Brave
export async function isBraveBrowser(): Promise<boolean> {
    try {
        return !!(navigator as any).brave && await (navigator as any).brave.isBrave();
    } catch {
        return false;
    }
}