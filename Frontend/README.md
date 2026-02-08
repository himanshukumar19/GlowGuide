# GlowGuide 🌟

A modern, comprehensive skincare e-commerce platform offering personalized skincare recommendations, shopping experience, and educational content about skin types and care routines.

## 🚀 Features

- **Personalized Skin Quiz** - Interactive quiz to determine your skin type and get tailored product recommendations
- **E-commerce Shop** - Browse and purchase skincare products with advanced filtering and sorting
- **Shopping Cart & Wishlist** - Full-featured cart with promo codes, GST calculation, and wishlist management
- **Skin Type Education** - Detailed information about different skin types and suitable products
- **Dark/Light Theme** - Seamless theme switching for better user experience
- **Responsive Design** - Optimized for all devices (mobile, tablet, desktop)

## 📋 Project Flow

### User Journey
```
1. Home Page → Learn about skincare and GlowGuide
2. Skin Quiz → Take interactive quiz to determine skin type
3. Results → Get personalized recommendations
4. Shop → Browse categorized products with filters
5. Product Details → View detailed product information
6. Cart → Review items, apply promo codes, calculate totals
7. Checkout → Complete purchase with order summary
8. About Skincare → Educational content about skin types
```

### Application Architecture
```
Frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── layout/       # Navbar, Footer, Layout
│   │   ├── shop/         # Product cards, filters, sorting
│   │   └── ui/           # shadcn-ui components
│   ├── pages/            # Route-based page components
│   │   ├── Index.tsx             # Landing page
│   │   ├── SkinQuiz.tsx          # Interactive quiz
│   │   ├── ShopPage.tsx          # Product catalog
│   │   ├── ProductDetailPage.tsx # Product details
│   │   ├── CartPage.tsx          # Shopping cart
│   │   ├── CheckoutPage.tsx      # Order checkout
│   │   └── WishlistPage.tsx      # Saved products
│   ├── context/          # State management
│   │   ├── CartContext.tsx       # Cart logic & promo codes
│   │   ├── WishlistContext.tsx   # Wishlist management
│   │   └── ThemeContext.tsx      # Theme switching
│   ├── data/             # Static data & configurations
│   └── types/            # TypeScript type definitions
```

## 🛠️ Technologies Used

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn-ui
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **State Management:** React Context API
- **Form Handling:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Notifications:** Sonner

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/himanshukumar19/GlowGuide.git

# Navigate to Frontend directory
cd GlowGuide/Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 📱 Key Features Breakdown

### Shopping Cart
- Add/remove products
- Quantity management
- Promo code support (GLOW10, SKINCARE15, WELCOME20)
- GST calculation (18%)
- Free shipping on orders ₹999+
- Move items to wishlist

### Product Catalog
- 50+ curated skincare products
- Category filtering (Korean, Laser, Children, Men/Women, Elderly)
- Price range filtering
- Multiple sorting options
- Real-time search

### Skin Quiz
- 10 interactive questions
- Personalized skin type results
- Tailored product recommendations
- Educational content about skin types

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Himanshu Kumar**
- GitHub: [@himanshukumar19](https://github.com/himanshukumar19)

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Design inspiration from modern e-commerce platforms
