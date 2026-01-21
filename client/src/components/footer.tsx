import { motion } from "framer-motion";
import { Link } from "wouter";
import { Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import RickshawWheel from "./airbear-wheel";

export default function Footer() {
  const quickLinks = [
    { name: "Book a Ride", href: "/map" },
    { name: "Shop Bodega", href: "/bodega" },
    { name: "Eco Impact", href: "/#eco" },
    { name: "Become a Driver", href: "/auth?mode=driver" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/support" },
    { name: "Safety", href: "/safety" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/airbear-mascot.png" 
                alt="AirBear mascot" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  console.warn('AirBear mascot image failed to load in footer');
                }}
              />
              <div>
                <h3 className="text-2xl font-bold">AirBear</h3>
                <p className="text-emerald-200">Solar Rickshaw Revolution</p>
              </div>
            </div>
            
            <p className="text-emerald-200 mb-6 max-w-md">
              <span className="font-bold text-lime-300">"AirBear flair, ride without a care—solar power in the air!"</span>
              <br />
              Transforming transportation in Binghamton with eco-friendly AirBears, 
              mobile bodegas, and community-driven sustainability.
            </p>
            
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-testid="link-twitter"
              >
                <Twitter className="h-4 w-4" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-testid="link-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href}>
                    <motion.a 
                      className="text-emerald-200 hover:text-white transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </motion.a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h4 className="font-semibold mb-4 text-lg">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.href}>
                    <motion.a 
                      className="text-emerald-200 hover:text-white transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      data-testid={`footer-support-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </motion.a>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div 
          className="mt-12 pt-8 border-t border-emerald-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="font-semibold text-lg mb-2">Stay Updated</h4>
              <p className="text-emerald-200">Get the latest news about sustainable transportation</p>
            </div>
            
            <div className="flex space-x-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 md:w-64"
                data-testid="input-newsletter-email"
                id="newsletter-email"
              />
              <motion.button 
                className="px-6 py-2 bg-white text-emerald-900 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-testid="button-newsletter-subscribe"
                onClick={() => {
                  const emailInput = document.getElementById('newsletter-email') as HTMLInputElement;
                  if (emailInput && emailInput.value) {
                    alert(`Thank you for subscribing with ${emailInput.value}!`);
                    emailInput.value = '';
                  } else {
                    alert('Please enter a valid email address');
                  }
                }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-emerald-800 mt-12 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-emerald-200 mb-4 md:mb-0">
              © 2024 AirBear. Made with 🌱 in Binghamton, NY.
            </p>
            
            <div className="flex items-center space-x-6 text-emerald-200">
              <span className="font-semibold">"Glide with AirBear, eco-rides so rare!"</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs">Powered by</span>
                <img
                  src="/airbear-mascot.png"
                  alt="AirBear mascot"
                  className="w-6 h-6 rounded-full object-cover border border-emerald-200 animate-spin-slow hover:animate-bounce"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    console.warn('AirBear mascot image failed to load in footer bottom');
                  }}
                />
                <span className="text-xs font-semibold">Solar Energy</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </footer>
  );
}
