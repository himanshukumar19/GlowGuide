import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center gradient-hero">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center shadow-card"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Search className="h-12 w-12 text-primary-foreground" />
          </motion.div>
          
          <h1 className="font-heading text-6xl font-bold text-gradient mb-4">404</h1>
          <h2 className="font-heading text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to discovering your best skin!
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="gradient-primary border-0 text-primary-foreground shadow-soft">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/quiz">
              <Button size="lg" variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Take the Quiz
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFound;
