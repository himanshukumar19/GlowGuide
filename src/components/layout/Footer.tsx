import { Link } from "react-router-dom";
import { Sparkles, Heart, Instagram, Twitter, Youtube, Mail } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Skin Types", path: "/skin-types" },
    { label: "Skin Quiz", path: "/quiz" },
    { label: "K-Beauty", path: "/korean-skincare" },
    { label: "Diet & Nutrition", path: "/diet" },
  ],
  resources: [
    { label: "Myths vs Facts", path: "/myths-facts" },
    { label: "Ingredients Guide", path: "/ingredients" },
    { label: "Common Mistakes", path: "/mistakes" },
    { label: "Glossary", path: "/glossary" },
  ],
  byAge: [
    { label: "Children", path: "/age/children" },
    { label: "Teens", path: "/age/teens" },
    { label: "Adults", path: "/age/adults" },
    { label: "Seniors", path: "/age/seniors" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
              <span className="font-heading text-xl font-bold">GlowGuide</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm">
              Your complete guide to healthy, glowing skin. Expert advice, personalized routines, 
              and education for all skin types and ages.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Age */}
          <div>
            <h3 className="font-heading font-semibold mb-4">By Age</h3>
            <ul className="space-y-2">
              {footerLinks.byAge.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground">
              <strong>Medical Disclaimer:</strong> This website provides general skincare information and education. 
              It is not a substitute for professional medical advice, diagnosis, or treatment. 
              Always consult a qualified dermatologist for personalized skincare recommendations 
              and before starting any new treatment.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for healthy skin
            </p>
            <p>© {new Date().getFullYear()} GlowGuide. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
