import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RickshawWheel from "@/components/airbear-wheel";
import LoadingSpinner from "@/components/loading-spinner";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Sparkles, 
  Leaf, 
  Star,
  Filter,
  Search,
  X
} from "lucide-react";
import { Link } from "wouter";

interface BodegaItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string | null;
  category: string;
  isEcoFriendly: boolean;
  isAvailable: boolean;
  stock: number;
}

interface CartItem extends BodegaItem {
  quantity: number;
}

export default function Bodega() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSparkles, setShowSparkles] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery<BodegaItem[]>({
    queryKey: ["/api/bodega/items", selectedCategory === "all" ? null : selectedCategory],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order will be ready for pickup during your next ride.",
      });
      setCart([]);
      setShowCart(false);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Unable to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: "all", name: "All", icon: "fas fa-grid-2" },
    { id: "beverages", name: "Beverages", icon: "fas fa-coffee" },
    { id: "food", name: "Food", icon: "fas fa-apple-alt" },
    { id: "snacks", name: "Snacks", icon: "fas fa-cookie-bite" },
    { id: "accessories", name: "Accessories", icon: "fas fa-shopping-bag" },
  ];

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const addToCart = (item: BodegaItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
      }
    });

    // Trigger sparkle animation
    setShowSparkles(item.id);
    setTimeout(() => setShowSparkles(null), 600);

    toast({
      title: "Added to cart!",
      description: `${item.name} added to your cart`,
    });
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user.id,
      items: cart.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: getTotalPrice().toFixed(2),
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading bodega..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Mobile <span className="text-amber-500">Bodega</span> Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Shop local products during your ride with sparkling add-to-cart magic
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setShowCart(true)}
            className="relative hover-lift"
            data-testid="button-show-cart"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-muted/50">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-${category.id}`}
                >
                  <i className={`${category.icon} mr-2 text-sm`}></i>
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <Card className="glass-morphism hover-lift group h-full" data-testid={`card-product-${item.id}`}>
                  <CardHeader className="pb-3">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg mb-4 overflow-hidden relative group-hover:scale-105 transition-transform">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-4xl text-muted-foreground"></i>
                        </div>
                      )}
                      
                      {/* Eco Badge */}
                      {item.isEcoFriendly && (
                        <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                          <Leaf className="h-3 w-3 mr-1" />
                          Eco
                        </Badge>
                      )}
                      
                      {/* Stock Badge */}
                      {item.stock < 5 && item.stock > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-muted-foreground">4.8</span>
                      </div>
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-muted/20 rounded-lg">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => {
                            const cartItem = cart.find(c => c.id === item.id);
                            if (cartItem && cartItem.quantity > 1) {
                              updateCartQuantity(item.id, cartItem.quantity - 1);
                            }
                          }}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {cart.find(c => c.id === item.id)?.quantity || 0}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => addToCart(item, 1)}
                          disabled={!item.isAvailable || item.stock === 0}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable || item.stock === 0}
                        className="eco-gradient text-white hover-lift ripple-effect relative"
                        data-testid={`button-add-to-cart-${item.id}`}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Add
                        
                        {/* Sparkle Effect */}
                        <AnimatePresence>
                          {showSparkles === item.id && (
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 8 }, (_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-amber-400 rounded-full"
                                  style={{
                                    top: "50%",
                                    left: "50%",
                                  }}
                                  initial={{ scale: 0, x: 0, y: 0 }}
                                  animate={{ 
                                    scale: [0, 1, 0],
                                    x: Math.cos(i * 45 * Math.PI / 180) * 30,
                                    y: Math.sin(i * 45 * Math.PI / 180) * 30,
                                  }}
                                  transition={{ duration: 0.6 }}
                                />
                              ))}
                            </div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <RickshawWheel size="xl" className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "No products available in this category"}
            </p>
          </motion.div>
        )}

        {/* Shopping Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="glass-morphism max-w-md" data-testid="dialog-cart">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Your Cart
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCart(false)}
                  data-testid="button-close-cart"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-muted/10 rounded-lg"
                        data-testid={`cart-item-${item.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            ${parseFloat(item.price).toFixed(2)} each
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-cart-decrease-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-cart-increase-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-sm font-medium ml-3">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                    </div>
                    
                    {user ? (
                      <Button 
                        onClick={handleCheckout}
                        disabled={createOrderMutation.isPending}
                        className="w-full eco-gradient text-white hover-lift animate-pulse-glow"
                        data-testid="button-checkout"
                      >
                        {createOrderMutation.isPending ? (
                          <div className="flex items-center">
                            <RickshawWheel size="sm" className="mr-2" />
                            Placing Order...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <RickshawWheel size="sm" className="mr-2" />
                            Checkout on Arrival
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Link to="/auth">
                        <Button className="w-full eco-gradient text-white" data-testid="button-sign-in-to-checkout">
                          Sign In to Checkout
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
