import { kv } from "@vercel/kv";

const STORE_KEY = "shopyar:store";
const ORDERS_KEY = "shopyar:orders";

export default async function handler(request, response) {
  try {
    const env = {
      ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
      ADMIN_PASSWORD_HASH: Boolean(process.env.ADMIN_PASSWORD_HASH),
      ADMIN_TOKEN: Boolean(process.env.ADMIN_TOKEN),
      KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
      KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN)
    };

    let kvStatus = {
      connected: false,
      storeExists: false,
      productCount: 0,
      orderCount: 0
    };

    try {
      const store = await kv.get(STORE_KEY);
      const orders = await kv.get(ORDERS_KEY);
      kvStatus = {
        connected: true,
        storeExists: Boolean(store),
        productCount: Array.isArray(store?.products) ? store.products.length : 0,
        orderCount: Array.isArray(orders) ? orders.length : 0
      };
    } catch (error) {
      kvStatus.error = "Vercel KV is not connected or its environment variables are missing.";
    }

    return response.status(200).json({
      ok: Object.values(env).every(Boolean) && kvStatus.connected,
      env,
      kv: kvStatus
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: "Setup check failed",
      message: error.message
    });
  }
}
