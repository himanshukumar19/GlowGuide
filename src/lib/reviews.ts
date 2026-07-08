import type { Review } from "@/types/product";

const reviewTemplates = [
  { userName: "Priya S.", rating: 5, title: "Amazing product!", text: "Been using this for 2 weeks and already seeing great results. Highly recommend!" },
  { userName: "Rahul M.", rating: 4, title: "Good quality", text: "Works well for my skin type. Fast delivery too." },
  { userName: "Sneha K.", rating: 5, title: "Best purchase ever", text: "My skin has never looked better. Will definitely repurchase." },
  { userName: "Amit P.", rating: 3, title: "Decent product", text: "Takes time to show results but overall satisfied." },
  { userName: "Neha G.", rating: 5, title: "Love it!", text: "Gentle on sensitive skin and smells amazing." },
  { userName: "Vikram R.", rating: 4, title: "Worth the price", text: "A bit expensive but the quality justifies it." },
  { userName: "Anjali D.", rating: 5, title: "Game changer", text: "This has completely transformed my skincare routine." },
  { userName: "Karan S.", rating: 4, title: "Effective", text: "Noticed improvement in skin texture within a week." },
];

export const generateReviews = (productId: string): Review[] => {
  return reviewTemplates.map((template, index) => ({
    id: `${productId}-review-${index}`,
    userName: template.userName,
    rating: template.rating,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
    reviewTitle: template.title,
    reviewText: template.text,
    verified: Math.random() > 0.3,
    helpful: Math.floor(Math.random() * 50),
  }));
};
