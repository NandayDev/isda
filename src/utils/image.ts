export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64.split("base64,")[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const mimeFromBase64 = (
  base64: string
): { mime: string; ext: string } | undefined => {
  const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  const ext = mime && mime[1].split("/")[1];

  if (mime && ext) {
    return { mime: mime[1], ext };
  }
  return undefined;
};
