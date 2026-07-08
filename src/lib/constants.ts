export const categoryLabels: Record<string, string> = {
  "men-women": "Men & Women",
  korean: "Korean Skincare",
  children: "For Children",
  senior: "For Seniors",
  "laser-devices": "Laser Devices",
};

export const promoCodes = [
  { code: "FIRST10", discount: 10, minOrder: 0, description: "10% off on first order" },
  { code: "GLOW20", discount: 20, minOrder: 1500, description: "20% off on orders above ₹1500" },
  { code: "SKIN15", discount: 15, minOrder: 0, description: "15% off sitewide" },
  { code: "FREESHIP", discount: 0, minOrder: 500, description: "Free shipping on orders above ₹500", freeShipping: true },
  { code: "SUMMER25", discount: 25, minOrder: 2000, description: "25% off on orders above ₹2000" },
];
