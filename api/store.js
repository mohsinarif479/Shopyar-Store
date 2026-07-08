import { kv } from "@vercel/kv";

const STORE_KEY = "shopyar:store";

const defaultStore = {
  products: [],
  collections: ["Gadgets", "Home", "Kids", "Daily Use"],
  slider: {
    title: "Modern pieces for a lighter everyday look.",
    subtitle: "Explore the newest arrivals crafted in soft greens and calm neutrals.",
    image: ""
  },
  branding: {
    storeName: "Shopyar",
    logo: "assets/logo.jpg",
    backgroundLogo: "assets/logo.jpg",
    primaryColor: "#2f7d53",
    darkColor: "#1f5838",
    softColor: "#cfe2d0"
  },
  content: {
    heroEyebrow: "Everyday finds",
    heroTitle: "Products for home, gadgets, kids, and daily life.",
    heroText: "Shopyar brings useful products, smart gadgets, home essentials, and family favorites into one easy shopping place.",
    promoEyebrow: "Limited time offer",
    promoTitle: "Free shipping + exclusive bundles this weekend.",
    featureEyebrow: "Featured collection",
    featureTitle: "The calm collection",
    featureText: "Soft tones, premium finishes, and timeless pieces for the refined home and wardrobe.",
    ctaEyebrow: "Customer-first shopping",
    ctaTitle: "Place your order with ease and get your favorites delivered quickly.",
    footerText: "Useful gadgets, home products, kids items, and daily essentials for modern Pakistani families.",
    supportEmail: "support@shopyar.pk",
    supportPhone: "+92 300 1234567",
    whatsappNumber: "+92 300 1234567",
    shippingText: "Free shipping on orders over Rs 8,000",
    ratingText: "4.9/5 rated by customers",
    supportText: "Help when you need it"
  }
};

function isAuthorized(request) {
  const token = request.headers["x-admin-token"];
  return token && token === (process.env.ADMIN_TOKEN || "shopyar123");
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      const store = (await kv.get(STORE_KEY)) || defaultStore;
      return response.status(200).json(store);
    }

    if (request.method === "POST") {
      if (!isAuthorized(request)) {
        return response.status(401).json({ error: "Unauthorized" });
      }

      const current = (await kv.get(STORE_KEY)) || defaultStore;
      const next = { ...current, ...request.body };
      await kv.set(STORE_KEY, next);
      return response.status(200).json(next);
    }

    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return response.status(500).json({
      error: "Store API failed",
      message: error.message
    });
  }
}
