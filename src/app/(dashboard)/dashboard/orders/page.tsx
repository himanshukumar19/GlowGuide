'use client';

import { OrderHistoryList } from "@/components/orders/OrderHistoryList";

export default function OrderHistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrderHistoryList showHeading={true} />
    </div>
  );
}
