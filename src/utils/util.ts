export function formatPubKey(pubkey: string): string {
    if (pubkey.length <= 8) return pubkey;
    return `${pubkey.substring(0, 4)}...${pubkey.substring(pubkey.length - 4)}`;
}
