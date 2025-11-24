import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, Shield, Database, UserCheck, Globe } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an AirBear account, we collect your name, email address, phone number, and payment information."
        },
        {
          subtitle: "Location Data",
          text: "We collect precise location data when you use our services to provide rides, show nearby AirBears, and improve our routing algorithms."
        },
        {
          subtitle: "Usage Information",
          text: "We collect information about your interactions with our platform, including rides taken, bodega purchases, and app usage patterns."
        },
        {
          subtitle: "Device Information",
          text: "We collect device identifiers, operating system information, and mobile network data to optimize app performance."
        }
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide, maintain, and improve AirBear services, including matching riders with drivers and processing payments."
        },
        {
          subtitle: "Safety and Security",
          text: "Your data helps us verify identities, prevent fraud, ensure platform safety, and respond to emergencies."
        },
        {
          subtitle: "Communication",
          text: "We send you ride updates, promotional offers, and important service announcements. You can opt out of marketing communications anytime."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to improve our services, develop new features, and enhance user experience."
        }
      ]
    },
    {
      icon: Shield,
      title: "How We Protect Your Information",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols. Payment information is processed through PCI-compliant systems."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and authentication measures to ensure only authorized personnel can access user data."
        },
        {
          subtitle: "Regular Audits",
          text: "Our security practices undergo regular third-party audits and penetration testing to identify and address vulnerabilities."
        },
        {
          subtitle: "Data Minimization",
          text: "We only collect and retain data necessary for providing our services and delete information when no longer needed."
        }
      ]
    },
    {
      icon: Globe,
      title: "Information Sharing",
      content: [
        {
          subtitle: "With Drivers",
          text: "When you book a ride, we share your name, pickup location, and destination with your assigned driver."
        },
        {
          subtitle: "Service Providers",
          text: "We share data with trusted third-party service providers who help us operate our platform (payment processors, cloud hosting, analytics)."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or in response to valid legal requests."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, user information may be transferred to the acquiring entity."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights and Choices",
      content: [
        {
          subtitle: "Access and Portability",
          text: "You can request a copy of your personal data in a machine-readable format at any time through your account settings."
        },
        {
          subtitle: "Correction and Deletion",
          text: "You have the right to update inaccurate information or request deletion of your account and associated data."
        },
        {
          subtitle: "Location Settings",
          text: "You can control location permissions through your device settings, though this may limit certain app features."
        },
        {
          subtitle: "Marketing Preferences",
          text: "Opt out of promotional communications by clicking 'unsubscribe' in emails or adjusting settings in your account."
        },
        {
          subtitle: "Do Not Sell",
          text: "We do not sell your personal information to third parties. You can exercise your rights under applicable privacy laws."
        }
      ]
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
              <Lock className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: October 14, 2025
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            At AirBear, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-morphism">
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy describes how AirBear Mobile Bodega ("AirBear," "we," "us," or "our") collects, uses, and shares information about you when you use our mobile application, website, and services (collectively, the "Services"). By using our Services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={sectionIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + sectionIndex * 0.1 }}
            className="mb-8"
          >
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="font-semibold mb-2">{item.subtitle}</h4>
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Additional Sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-8"
        >
          {/* Cookies */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities and preferences. This helps us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our Services</li>
                <li>Improve our platform performance</li>
                <li>Deliver personalized content and advertisements</li>
              </ul>
              <p className="text-muted-foreground">
                You can control cookies through your browser settings, though disabling cookies may affect certain features of our Services.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@airbear.com, and we will delete such information.
              </p>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your jurisdiction. We take appropriate safeguards to ensure your personal information remains protected in accordance with this Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-2xl">Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Significant changes will be communicated via email or in-app notification. Your continued use of our Services after changes become effective constitutes acceptance of the revised policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="glass-morphism bg-gradient-to-r from-primary/5 to-green-500/5">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@airbear.com</p>
                <p><strong>Phone:</strong> 1-800-AIRBEAR</p>
                <p><strong>Mail:</strong> AirBear Mobile Bodega, 123 Eco Street, Binghamton, NY 13901</p>
              </div>
              <p className="text-sm text-muted-foreground italic">
                For data protection inquiries in the EU, contact our Data Protection Officer at dpo@airbear.com
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
