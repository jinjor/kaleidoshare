function buf2hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export function randomHex(length: number): string {
  return buf2hex(crypto.getRandomValues(new Uint8Array(length)));
}
