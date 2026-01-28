import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle, Scale, Ban, DollarSign, Shield } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By accessing or using AirBear's mobile application, website, or services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use our Services. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.`
    },
    {
      icon: Shield,
      title: "2. Service Description",
      content: `AirBear provides solar-powered AirBear transportation services and mobile bodega shopping experiences in Binghamton, NY. Our Services include ride booking, real-time tracking, payment processing, and access to local products through our mobile bodega platform. We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time without prior notice.`
    },
    {
      icon: Scale,
      title: "3. User Accounts",
      content: `To use our Services, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to create an account. You agree to notify us immediately of any unauthorized use of your account.`
    },
    {
      icon: DollarSign,
      title: "4. Payment and Pricing",
      content: `You agree to pay all fees and charges associated with your use of the Services, including ride fares, bodega purchases, and any applicable taxes. Prices are subject to change without notice. Payment is processed through our secure third-party payment processor (Stripe). You authorize us to charge your selected payment method for all fees incurred. Refunds are provided at our sole discretion and in accordance with our refund policy.`
    },
    {
      icon: Ban,
      title: "5. Prohibited Conduct",
      content: `You agree not to: (a) use the Services for any illegal purpose; (b) harass, abuse, or harm other users or drivers; (c) interfere with or disrupt the Services; (d) attempt to gain unauthorized access to our systems; (e) use automated systems to access the Services; (f) impersonate any person or entity; (g) violate any applicable laws or regulations; or (h) engage in any conduct that could damage AirBear's reputation or business.`
    },
    {
      icon: AlertCircle,
      title: "6. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, AIRBEAR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO AIRBEAR IN THE TWELVE MONTHS PRECEDING THE CLAIM.`
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: October 14, 2025
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            Please read these terms carefully before using AirBear's services
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-morphism border-primary/20">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to AirBear! These Terms of Service ("Terms") govern your use of our solar-powered AirBear transportation and mobile bodega services. By using AirBear, you enter into a legally binding agreement with AirBear Mobile Bodega, Inc. Please read these Terms carefully.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
            className="mb-6"
          >
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Additional Sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="space-y-6"
        >
          {/* Ride Terms */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">7. Ride-Specific Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Booking and Cancellation</h4>
                <p className="text-muted-foreground">
                  Rides must be booked through the AirBear app. You may cancel rides up to 5 minutes before the scheduled pickup time without penalty. Late cancellations may incur a cancellation fee. No-shows will be charged the full ride fare.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Passenger Conduct</h4>
                <p className="text-muted-foreground">
                  Passengers must treat drivers with respect, follow safety instructions, and comply with all applicable laws. Disruptive behavior, damage to vehicles, or violation of our community standards may result in account suspension or termination.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Lost Items</h4>
                <p className="text-muted-foreground">
                  AirBear is not responsible for items left in vehicles. We will make reasonable efforts to help you recover lost items, but we cannot guarantee their return.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CEO T-Shirt Terms */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">8. CEO T-Shirt Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Benefits and Restrictions</h4>
                <p className="text-muted-foreground">
                  The CEO-signed AirBear T-shirt ($100) grants purchasers one complimentary ride per 24-hour period. This benefit is non-transferable and tied exclusively to the purchaser's account. Benefits cannot be sold, gifted, or shared. Violation of these terms results in immediate termination of benefits without refund.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ride Limitations</h4>
                <p className="text-muted-foreground">
                  Free rides are limited to standard AirBear routes within Binghamton. Premium routes, extended trips, or special event transportation may incur additional charges. The daily ride benefit resets at midnight EST.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">9. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, audio clips, and software, are the exclusive property of AirBear or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Services without our express written permission.
              </p>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">10. Dispute Resolution and Arbitration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Any dispute arising out of or relating to these Terms or the Services shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules. You waive your right to participate in a class action lawsuit or class-wide arbitration.
              </p>
              <p className="text-muted-foreground">
                These Terms shall be governed by the laws of the State of New York, without regard to its conflict of law provisions.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">11. Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account and access to the Services at any time, with or without cause, and with or without notice. Upon termination, your right to use the Services will immediately cease. Sections of these Terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </CardContent>
          </Card>

          {/* Severability */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl">12. Severability and Waiver</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect. Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass-morphism bg-gradient-to-r from-primary/5 to-green-500/5">
            <CardHeader>
              <CardTitle className="text-xl">13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@airbear.com</p>
                <p><strong>Phone:</strong> 1-800-AIRBEAR</p>
                <p><strong>Mail:</strong> AirBear Mobile Bodega, Inc., 123 Eco Street, Binghamton, NY 13901</p>
              </div>
              <p className="text-sm text-muted-foreground italic mt-4">
                By using AirBear's Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
