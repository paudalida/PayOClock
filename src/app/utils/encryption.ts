// Generate a key for AES encryption
async function generateKey() {
  return await crypto.subtle.generateKey(
      {
          name: "AES-CBC",
          length: 256,  // AES-256
      },
      true,
      ["encrypt", "decrypt"]
  );
}

// Encrypt function
async function encrypt(text: any, key: any) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const iv = crypto.getRandomValues(new Uint8Array(16));  // Generate a random IV
  
  const encrypted = await crypto.subtle.encrypt(
      {
          name: "AES-CBC",
          iv: iv,
      },
      key,
      data
  );
  
  return { iv, encryptedData: encrypted };
}

// Decrypt function
async function decrypt(encryptedData: any, key: any, iv: any) {
  const decrypted = await crypto.subtle.decrypt(
      {
          name: "AES-CBC",
          iv: iv,
      },
      key,
      encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Example usage
(async () => {
  const key = await generateKey();
  
  const { iv, encryptedData } = await encrypt("Hello World", key);
  
  const decryptedText = await decrypt(encryptedData, key, iv);
  
})();