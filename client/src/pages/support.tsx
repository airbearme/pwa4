import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Search
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Support() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I book an AirBear ride?",
      answer: "Navigate to the Map page, select your pickup location, choose your destination, and confirm your booking. AirBears are available at 16 locations across Binghamton."
    },
    {
      question: "What are the benefits of the CEO T-Shirt?",
      answer: "The CEO-signed AirBear T-shirt ($100) grants you one complimentary ride every 24 hours, VIP priority access, and an authentic CEO signature. Benefits are non-transferable and tied to your account."
    },
    {
      question: "How does the mobile bodega work?",
      answer: "Shop local products during your ride! Browse items in the Bodega section, add them to your cart, and they'll be available for pickup when you arrive at your destination."
    },
    {
      question: "Are AirBears really 100% solar powered?",
      answer: "Yes! All our rickshaws are powered entirely by solar energy, producing zero emissions and helping reduce Binghamton's carbon footprint."
    },
    {
      question: "How do I earn Eco Points?",
      answer: "Earn Eco Points by taking rides, shopping at the bodega, completing weekly challenges, and referring friends. Points can be redeemed for rewards and discounts."
    },
    {
      question: "What if I need to cancel my ride?",
      answer: "You can cancel your ride up to 5 minutes before pickup without any charges. Navigate to your Dashboard to manage active bookings."
    },
    {
      question: "How do I become an AirBear driver?",
      answer: "Click 'Become a Driver' in the footer or contact us at drivers@airbear.com. We provide training, solar rickshaws, and competitive earnings."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, Apple Pay, and Google Pay through our secure Stripe integration."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Our support team will get back to you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Help <span className="text-primary">Center</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to your questions and support when you need it
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </motion.div>

        {/* Contact Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="glass-morphism hover-lift">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                support@airbear.com
              </p>
              <p className="text-xs text-muted-foreground">
                Response within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism hover-lift">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                1-800-AIRBEAR
              </p>
              <p className="text-xs text-muted-foreground">
                Mon-Fri 9AM-6PM EST
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism hover-lift">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our team
              </p>
              <Button size="sm" className="eco-gradient text-white">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-morphism h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start">
                      <HelpCircle className="h-5 w-5 text-primary mr-2 mt-1 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
            </div>
          )}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="glass-morphism max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input placeholder="Your name" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="How can we help?" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea 
                    placeholder="Describe your issue or question..." 
                    rows={5}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full eco-gradient text-white">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
