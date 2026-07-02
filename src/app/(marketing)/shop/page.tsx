import dynamic from 'next/dynamic';

const ShopContent = dynamic(() => import('./ShopContent'), { ssr: false });

export default function ShopPage() {
  return <ShopContent />;
}
