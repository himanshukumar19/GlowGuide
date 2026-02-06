import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Check, 
  Truck, 
  Shield, 
  RefreshCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getProductById, getRelatedProducts, generateReviews, categoryLabels } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/shop/ProductCard';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const product = id ? getProductById(id) : null;
  const relatedProducts = product ? getRelatedProducts(product) : [];
  const reviews = product ? generateReviews(product.id) : [];

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const badgeColors: Record<string, string> = {
    bestseller: 'bg-amber-500 text-white',
    new: 'bg-teal-500 text-white',
    organic: 'bg-green-500 text-white',
    'dermatologist-tested': 'bg-blue-500 text-white',
    'cruelty-free': 'bg-pink-500 text-white',
    vegan: 'bg-emerald-500 text-white',
    natural: 'bg-lime-500 text-white',
    'korean-formula': 'bg-purple-500 text-white'
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-foreground">
            {categoryLabels[product.category]}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount && product.discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-sm px-3 py-1">
                  {product.discount}% OFF
                </Badge>
              )}
              {product.badges?.map((badge) => (
                <Badge key={badge} className={`text-sm px-3 py-1 ${badgeColors[badge] || 'bg-muted'}`}>
                  {badge.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="text-green-600">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </Badge>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground">{product.shortDescription}</p>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Size:</span>
              <Badge variant="outline">{product.volume}</Badge>
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">In Stock</span>
                {product.stockCount < 20 && (
                  <span className="text-orange-500">
                    (Only {product.stockCount} left!)
                  </span>
                )}
              </div>
            ) : (
              <div className="text-destructive font-medium">Out of Stock</div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-muted rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-background rounded transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-background rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 gradient-primary text-primary-foreground h-12 text-lg gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                className={`h-12 w-12 ${inWishlist ? 'border-red-500 text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">Free Delivery</p>
                <p className="text-xs text-muted-foreground">Above ₹999</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">100% Authentic</p>
                <p className="text-xs text-muted-foreground">Genuine Products</p>
              </div>
              <div className="text-center">
                <RefreshCcw className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-Day Policy</p>
              </div>
            </div>

            {/* Where to Buy */}
            {Object.keys(product.whereToBuy).length > 0 && (
              <div className="pt-4">
                <p className="text-sm font-medium mb-3">Also Available On:</p>
                <div className="flex flex-wrap gap-2">
                  {product.whereToBuy.amazon && (
                    <a href={product.whereToBuy.amazon} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        Amazon <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {product.whereToBuy.nykaa && (
                    <a href={product.whereToBuy.nykaa} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        Nykaa <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {product.whereToBuy.flipkart && (
                    <a href={product.whereToBuy.flipkart} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        Flipkart <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                  {product.whereToBuy.official && (
                    <a href={product.whereToBuy.official} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        Official Site <ExternalLink className="h-3 w-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger 
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="ingredients"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Ingredients
            </TabsTrigger>
            <TabsTrigger 
              value="how-to-use"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              How to Use
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-lg mb-6">{product.description}</p>
              
              <h3 className="text-lg font-semibold mb-4">Key Benefits</h3>
              <ul className="space-y-2">
                {product.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Suitable for Skin Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.skinTypes.map(type => (
                      <Badge key={type} variant="secondary" className="capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Addresses Concerns</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.concerns.map(concern => (
                      <Badge key={concern} variant="outline">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Key Ingredients</h3>
            <div className="flex flex-wrap gap-3">
              {product.ingredients.map((ingredient, i) => (
                <Badge key={i} variant="secondary" className="text-sm px-4 py-2">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="how-to-use" className="pt-6">
            <h3 className="text-lg font-semibold mb-4">How to Use</h3>
            <p className="text-muted-foreground">{product.howToUse}</p>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-medium mb-1">{review.reviewTitle}</h4>
                  <p className="text-muted-foreground">{review.reviewText}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {review.helpful} people found this helpful
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
