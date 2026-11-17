import "server-only";

import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";

function getEncryptionKey(): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY;

  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error("Invalid integration encryption key.");
  }

  return Buffer.from(key, "hex");
}

export function encrypt(value: string): string {
  const key = getEncryptionKey();

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decrypt(value: string): string {
  const key = getEncryptionKey();

  const [iv, authTag, encrypted] = value.split(":");

  if (!iv || !authTag || !encrypted) {
    throw new Error("Invalid encrypted value.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(
    Buffer.from(authTag, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
