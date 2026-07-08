# Product Data Architecture — Firestore + Cloudinary

Products and their images are stored in Firebase rather than as static TypeScript arrays. Product metadata lives in a `products` Firestore collection with an automatically generated document ID. Product images are uploaded to Cloudinary and their `secure_url` URLs are persisted alongside the metadata in Firestore.

Decided because: the previous approach (32 products in a static `src/data/products.ts` file) prevented real-time stock tracking, made admin CRUD operations impossible, and required a code deploy to change product data. Firestore and Cloudinary together provide a single source of truth accessible from both admin and public-facing pages.

Considered alternative: Firebase Storage. Rejected in favor of Cloudinary due to better CDN support, built-in image transformations, and simpler unsigned upload workflow for client-side admin image uploads.
