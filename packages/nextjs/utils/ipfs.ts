export const getIPFSUrl = (hash: string): string => {
  if (hash.startsWith("ipfs://")) {
    return hash.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  if (hash.startsWith("Qm") || hash.startsWith("bafy")) {
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return hash;
};

export const getIPFSUrlWithFallbacks = (hash: string): string[] => {
  const gateways = [
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/",
  ];

  let cleanHash = hash;
  if (hash.startsWith("ipfs://")) {
    cleanHash = hash.replace("ipfs://", "");
  }

  return gateways.map(gateway => `${gateway}${cleanHash}`);
};
