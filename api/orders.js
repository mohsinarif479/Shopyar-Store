import { kv } from "@vercel/kv";

const ORDERS_KEY = "shopyar:orders";

function isAuthorized(request) {
  const token = request.headers["x-admin-token"];
  return Boolean(token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      if (!isAuthorized(request)) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const orders = (await kv.get(ORDERS_KEY)) || [];
      return response.status(200).json(orders);
    }

    if (request.method === "POST") {
      const current = (await kv.get(ORDERS_KEY)) || [];
      const order = {
        ...request.body,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: "New"
      };
      const next = [order, ...current].slice(0, 500);
      await kv.set(ORDERS_KEY, next);
      return response.status(201).json(order);
    }

    if (request.method === "PUT") {
      if (!isAuthorized(request)) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const { id, status } = request.body || {};
      const allowedStatuses = ["New", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
      if (!id || !allowedStatuses.includes(status)) {
        return response.status(400).json({ error: "Invalid order status update" });
      }

      const current = (await kv.get(ORDERS_KEY)) || [];
      const next = current.map((order) =>
        Number(order.id) === Number(id) ? { ...order, status } : order
      );
      await kv.set(ORDERS_KEY, next);
      return response.status(200).json({ id, status });
    }

    response.setHeader("Allow", "GET, POST, PUT");
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return response.status(500).json({
      error: "Orders API failed",
      message: error.message
    });
  }
}
