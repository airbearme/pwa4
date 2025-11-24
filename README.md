
# 🐻 AirBear - Solar-Powered Eco-Ride Platform

**"AirBear flair, ride without a care—solar power in the air!"**

AirBear is a revolutionary solar-powered ride-sharing platform featuring eco-friendly vehicles with onboard mobile bodegas in Binghamton, NY. Our mission is to provide sustainable transportation while supporting local businesses and reducing carbon emissions.

## ✨ Key Features

### 🌟 **Triple Role System**
- **👨‍💼 Admin**: Fleet analytics, system monitoring, revenue tracking
- **🚗 Driver**: AirBear management, inventory control, ride confirmations  
- **👤 User**: Booking rides, shopping mobile bodega, viewing eco-impact

### 🎯 **Exclusive CEO T-Shirt Promo**
- **$100 Value**: CEO-signed authentic AirBear t-shirt
- **Daily Free Rides**: One complimentary ride every 24 hours
- **Non-Transferable**: Benefits tied exclusively to purchaser's account
- **VIP Access**: Priority booking and exclusive events

### 🗺️ **Interactive Binghamton Map**
- **16 Strategic Locations**: Full coverage across Binghamton from real spots.csv data
- **Spinning AirBear Markers**: Animated 🐻 logos with hover effects
- **Real-Time Updates**: Live ETA, distance calculations, availability
- **Solar-Powered Tracking**: Battery levels, charging status, maintenance

### 🎨 **Stunning Visual Effects**
- **Spinning Wheels**: Fire, neon, holographic, plasma effects
- **Solar Animations**: God rays, prism spectrums, solar winds  
- **Eco Particles**: Floating leaves, fireflies, clean air breezes
- **Motion Effects**: 3D tilts, ripples, glitches, vortexes, morphs
- **Performance**: 60fps optimized, low-power mode support

## 🚀 **AirBear Slogans**

- *"AirBear flair, ride without a care—solar power in the air!"*
- *"Glide with AirBear, eco-rides so rare!"*  
- *"Buy the tee, ride for free—AirBear's eco-key!"*

## 📱 Progressive Web App (PWA)

- **📲 One-Click Install**: Native app experience across devices
- **⚡ Lightning Fast**: Optimized performance and caching
- **📴 Offline Support**: Core features work without internet
- **🔔 Push Notifications**: Ride updates and eco-achievements

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** with custom eco-luxury theme
- **Framer Motion** for stunning animations
- **TanStack Query** for data management
- **Wouter** for lightweight routing

### Backend  
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Stripe** for payment processing
- **RESTful API** architecture

### Maps & Location
- **Leaflet** for interactive mapping
- **Custom AirBear Markers** with real-time data
- **Geolocation Services** for user positioning

## 🌍 Environmental Impact

- **🌱 Zero Emissions**: 100% solar-powered fleet
- **📊 CO₂ Tracking**: Real-time environmental impact metrics  
- **♻️ Sustainable Materials**: Eco-friendly vehicle components
- **🏆 Green Rewards**: Eco-points and sustainability challenges

## 💳 Monetization Strategy

### 🎯 **Advertising Tiers**
- **🥈 Silver**: Website banner ads, basic placement
- **🥇 Gold**: Premium website placement + AirBear LED banners
- **💎 Platinum**: Full integration + AirBear screen advertisements

### 💰 **Revenue Streams**  
- Ride booking fees
- Mobile bodega commissions
- CEO t-shirt exclusive sales
- Premium advertising placements
- Corporate partnerships

## 📥 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Quick Start
```bash
# Clone the repository
git clone https://github.com/airbearme/airbear-pwa.git
cd airbear-pwa

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to production
npm start
```

### Environment Variables
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (Optional - uses in-memory for development)
DATABASE_URL=postgresql://...

# API Configuration  
NODE_ENV=production
PORT=5000
```

## 🚀 Deployment Options

### IONOS SFTP Deployment
1. **Set up Environment Variables**:
   - Ensure your `.env` file includes IONOS SFTP credentials:
     ```env
     IONOS_SFTP_HOST=access-5018328928.webspace-host.com
     IONOS_SFTP_USER=your_sftp_username
     IONOS_SFTP_PASSWORD=your_sftp_password
     ```

2. **Build and Deploy**:
   ```bash
   npm run deploy:ionos
   ```

   This script will:
   - Build the production version
   - Create a deployment package
   - Upload to your IONOS SFTP server
   - Verify PWA features

3. **Access Your Live App**:
   - Visit `https://your-domain.com` (replace with your IONOS domain)
   - The PWA will prompt for installation on mobile devices

### Replit Static Deployment (Alternative)
1. Open Deployments tab in Replit
2. Select "Static" deployment type
3. Configure:
   - **Build Command**: `npm run build`
   - **Public Directory**: `dist`
4. Deploy with one click!

### Manual Deployment
```bash
# Build the application
npm run build

# Serve static files
npx serve dist -p 3000
```

## 📊 Analytics & Monitoring

- **Real-Time Fleet Status**: Live AirBear locations and availability
- **Revenue Tracking**: Detailed earnings and transaction analytics  
- **User Engagement**: Ride patterns, popular routes, user retention
- **Environmental Metrics**: CO₂ saved, solar energy generated
- **Performance Monitoring**: App speed, error tracking, user experience

## 🔐 Security & Compliance

- **🛡️ Data Protection**: GDPR and CCPA compliant data handling
- **🔒 Secure Payments**: PCI DSS compliant payment processing
- **🔐 Authentication**: Secure user authentication and authorization
- **📱 Device Security**: PWA security best practices

## 🤝 Contributing

We welcome contributions to make AirBear even better! 

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for clear history
- Component testing with React Testing Library

## 📞 Support & Contact

- **🌐 Website**: [airbear.app](https://airbear.app)
- **📧 Email**: support@airbear.app  
- **🐦 Twitter**: [@AirBearEco](https://twitter.com/AirBearEco)
- **💬 Discord**: [AirBear Community](https://discord.gg/airbear)

## 📄 License

Copyright © 2024 AirBear. All rights reserved.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with 🌱 by the AirBear team in Binghamton, NY**

*"Zero emissions, infinite possibilities with AirBear's solar-powered future!"*
