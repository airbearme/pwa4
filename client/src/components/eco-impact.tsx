import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, Users, Play } from "lucide-react";

export default function EcoImpact() {
  const impactData = [
    {
      icon: Leaf,
      title: "CO₂ Reduction", 
      value: "2,847 kg",
      subtitle: "CO₂ Saved This Month",
      color: "emerald",
      gradient: "from-emerald-100 to-green-100",
      progress: 68,
    },
    {
      icon: Sun,
      title: "Solar Energy",
      value: "15,240 kWh", 
      subtitle: "Clean Energy Generated",
      color: "amber",
      gradient: "from-orange-100 to-amber-100",
      progress: 82,
    },
    {
      icon: Users,
      title: "Community",
      value: "3,247",
      subtitle: "Active Community Members", 
      color: "primary",
      gradient: "from-blue-100 to-emerald-100",
      progress: 91,
    },
  ];

  return (
    <section id="eco" className="relative py-20 bg-gradient-to-b from-emerald-50/30 to-lime-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Growing a <span className="text-green-500">Greener</span> Binghamton
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your environmental impact with beautiful tree-growth animations
          </p>
        </motion.div>

        {/* Eco Impact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {impactData.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glass-morphism hover-lift group h-full" data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <item.icon className={`h-8 w-8 text-${item.color}-500 group-hover:animate-bounce`} />
                  </div>
                  
                  {/* Visual representation */}
                  <div className={`relative h-48 bg-gradient-to-b ${item.gradient} rounded-lg mb-4 overflow-hidden`}>
                    {/* Background image or pattern */}
                    <div className="absolute inset-0 opacity-60">
                      {item.title === "CO₂ Reduction" && (
                        <div className="w-full h-full bg-gradient-to-t from-green-200 to-green-50 flex items-end justify-center pb-4">
                          <motion.div
                            className="text-6xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            🌳
                          </motion.div>
                        </div>
                      )}
                      
                      {item.title === "Solar Energy" && (
                        <div className="w-full h-full bg-gradient-to-t from-orange-200 to-yellow-50 flex items-center justify-center">
                          <motion.div
                            className="text-6xl"
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            ☀️
                          </motion.div>
                        </div>
                      )}
                      
                      {item.title === "Community" && (
                        <div className="w-full h-full bg-gradient-to-t from-blue-200 to-purple-50 flex items-center justify-center">
                          <motion.div
                            className="text-6xl"
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            🤝
                          </motion.div>
                        </div>
                      )}
                    </div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 4 }, (_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-2 h-2 bg-${item.color}-500 rounded-full`}
                          style={{
                            left: `${20 + i * 20}%`,
                            top: `${Math.random() * 80 + 10}%`,
                          }}
                          animate={{
                            y: [-10, 10, -10],
                            opacity: [0.6, 1, 0.6],
                          }}
                          transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.div 
                      className={`text-3xl font-bold text-${item.color}-500 mb-2`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {item.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground mb-3">{item.subtitle}</div>
                    
                    {/* Progress bar */}
                    <div className={`bg-${item.color}-100 rounded-full h-2 overflow-hidden`}>
                      <motion.div 
                        className={`bg-${item.color}-500 h-full rounded-full`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Spinning Wheel Challenge */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="glass-morphism max-w-2xl mx-auto" data-testid="card-eco-challenge">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Weekly Eco Challenge</h3>
              <p className="text-muted-foreground mb-6">
                Spin the wheel to unlock your next sustainability mission!
              </p>
              
              {/* Challenge Wheel */}
              <motion.div 
                className="relative w-48 h-48 mx-auto mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="absolute inset-0 eco-gradient rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-2 bg-card rounded-full flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <motion.div
                      className="text-4xl mb-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🎯
                    </motion.div>
                    <div className="text-sm font-medium">
                      Spin for<br />Challenge
                    </div>
                  </div>
                </div>
              </motion.div>

              <Button 
                size="lg"
                className="eco-gradient text-white hover-lift animate-pulse-glow ripple-effect"
                data-testid="button-start-challenge"
              >
                <Play className="mr-3 h-4 w-4" />
                Start Challenge
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
