# Stock Decrement During Payment Verification

A Product's `stockCount` is decremented inside the `POST /api/orders/verify` handler, after the Razorpay HMAC signature is confirmed. It is not decremented when the Razorpay order is first created, nor at any other point in the flow.

Decided because: decrementing before payment confirmation would require a compensating increment on payment failure — introducing a race condition where stock could remain incorrectly low if the increment fails. Waiting until after verified payment guarantees the decrement only succeeds when the transaction is complete. The subscription payment flow (ADR-0002-referenced routes) already uses this same pattern.

Considered alternative: decrementing stock at order creation time with a timeout-based rollback. Rejected because it requires additional state tracking and cleanup logic that adds complexity without meaningful benefit for a low-concurrency skincare shop.
