# Order Snapshot Strategy

When an Order is created in the `orders` Firestore collection, the `items` array stores a full snapshot of each purchased Product at the time of checkout — including `id`, `name`, `image`, `price`, and `quantity`. It does not store only a product ID reference.

Decided because: if a product's name, price, or image changes later (or the product is deleted entirely by an admin), historic orders must remain accurate and displayable. Referencing only a product ID would break the order history page whenever products change.

Trade-off: order documents are slightly larger (400–800 bytes extra per line item in snapshot vs. just an ID). Accepted because order history integrity matters more than storage size for an e-commerce app.
