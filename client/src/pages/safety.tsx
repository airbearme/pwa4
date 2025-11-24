import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Phone,
  MapPin,
  Heart,
  Lock
} from "lucide-react";

export default function Safety() {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Driver Verification",
      description: "All drivers undergo comprehensive background checks and safety training before joining the AirBear fleet.",
      color: "primary"
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Share your ride with friends and family. Track your AirBear in real-time from pickup to destination.",
      color: "green"
    },
    {
      icon: Phone,
      title: "24/7 Emergency Support",
      description: "Access emergency assistance anytime with our dedicated safety hotline: 1-800-SAFE-BEAR",
      color: "red"
    },
    {
      icon: Users,
      title: "Community Standards",
      description: "We maintain strict community guidelines to ensure respectful and safe interactions for all users.",
      color: "purple"
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "All transactions are encrypted and processed through secure payment gateways. We never store your full card details.",
      color: "amber"
    },
    {
      icon: Heart,
      title: "Insurance Coverage",
      description: "Every ride is covered by comprehensive insurance for your peace of mind.",
      color: "pink"
    }
  ];

  const safetyTips = [
    "Always verify the driver and vehicle match your app before entering",
    "Share your trip details with a friend or family member",
    "Wear your seatbelt at all times during the ride",
    "If you feel uncomfortable, ask the driver to end the trip",
    "Report any safety concerns immediately through the app",
    "Keep your belongings secure and don't leave items behind",
    "Use the in-app emergency button if you need immediate help",
    "Check the driver's rating and reviews before accepting the ride"
  ];

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
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Your <span className="text-primary">Safety</span> is Our Priority
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At AirBear, we're committed to providing safe, eco-friendly transportation for everyone in our community
          </p>
        </motion.div>

        {/* Safety Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-morphism hover-lift h-full">
                <CardHeader>
                  <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-full flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-500`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                Safety Tips for Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="glass-morphism bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-red-700">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Emergency Assistance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                If you're in an emergency situation during your ride, use one of these options:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-red-500" />
                    Call 911
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    For immediate police, fire, or medical emergencies
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-500" />
                    In-App Emergency
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tap the emergency button in your active ride screen
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-red-500" />
                    Safety Hotline
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    1-800-SAFE-BEAR (24/7 support)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community Standards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Community Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We expect all AirBear community members—riders and drivers—to treat each other with respect and courtesy. 
                Behavior that violates our community standards may result in account suspension or permanent removal from the platform.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Prohibited Behavior:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Harassment, discrimination, or hate speech of any kind</li>
                  <li>Physical or verbal abuse</li>
                  <li>Unwanted contact or inappropriate behavior</li>
                  <li>Damage to vehicles or property</li>
                  <li>Fraudulent activity or payment disputes</li>
                  <li>Violation of local laws or regulations</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Report any violations through the app or by contacting safety@airbear.com
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
