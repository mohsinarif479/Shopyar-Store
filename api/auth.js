import { createHash } from "node:crypto";
import { kv } from "@vercel/kv";

const ADMIN_HASH_KEY = "shopyar:admin-password-hash";

function hashPassword(password) {
  return createHash("sha256").update(String(password || "")).digest("hex");
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

async function getPasswordHash() {
  const storedHash = await kv.get(ADMIN_HASH_KEY);
  return storedHash || getRequiredEnv("ADMIN_PASSWORD_HASH");
}

function isAuthorized(request) {
  const token = request.headers["x-admin-token"];
  return Boolean(token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
}

export default async function handler(request, response) {
  try {
    if (request.method === "POST") {
      const { email, password } = request.body || {};
      const adminEmail = getRequiredEnv("ADMIN_EMAIL");
      const adminToken = getRequiredEnv("ADMIN_TOKEN");
      const passwordHash = await getPasswordHash();

      if (String(email || "").trim().toLowerCase() !== adminEmail.toLowerCase()) {
        return response.status(401).json({ error: "Invalid credentials" });
      }

      if (hashPassword(password) !== passwordHash) {
        return response.status(401).json({ error: "Invalid credentials" });
      }

      return response.status(200).json({ token: adminToken });
    }

    if (request.method === "PUT") {
      if (!isAuthorized(request)) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const { currentPassword, newPassword } = request.body || {};
      if (!newPassword || String(newPassword).length < 8) {
        return response.status(400).json({ error: "New password must be at least 8 characters" });
      }

      const passwordHash = await getPasswordHash();
      if (hashPassword(currentPassword) !== passwordHash) {
        return response.status(400).json({ error: "Current password is incorrect" });
      }

      await kv.set(ADMIN_HASH_KEY, hashPassword(newPassword));
      return response.status(200).json({ ok: true });
    }

    response.setHeader("Allow", "POST, PUT");
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return response.status(500).json({
      error: "Auth API failed",
      message: error.message
    });
  }
}
