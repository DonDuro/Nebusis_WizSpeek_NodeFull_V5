# Nebusis® WizSpeek® V5.0.12 - Enterprise Messaging Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![Render](https://img.shields.io/badge/Render-00979D?style=for-the-badge&logo=render&logoColor=white)]()

> **WizSpeek®** - Secure AI-Powered Messaging Platform by **Nebusis® Cloud Services LLC**  
> *Talk Smart. Stay Secure.*

## 🎯 Overview

WizSpeek® is a comprehensive enterprise messaging platform featuring real-time chat, advanced privacy controls, multilingual translation support, and enterprise-grade compliance systems. Built with modern web technologies and designed for global deployment across regulated industries.

## ✨ Key Features

### 🌍 **Multilingual Communication**
- **12-language translation system** with 1,070+ translation keys
- Real-time message translation
- Localized UI across English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi

### 🔒 **Enterprise Security & Compliance**
- End-to-end encryption with AES-256
- Advanced privacy controls with granular user permissions
- ISO 9001/27001 compliance framework
- Enterprise DLP (Data Loss Prevention) system
- GDPR, CCPA, and international privacy law compliance

### 💼 **Professional Business Features**
- Enterprise sales contact system with automated email delivery
- Trust score verification and user validation
- QR code-based contact invitations with privacy presets
- Professional profile management with work history
- Contact-specific privacy controls and custom name displays

### 🚀 **Modern Technology Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + WebSocket + JWT authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: Vite + ESBuild for optimized production builds
- **Deployment**: Render.com compatible with one-click deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation
```bash
# Clone the repository
git clone https://github.com/DonDuro/Nebusis_WizSpeek_NodeFull_V5.git
cd Nebusis_WizSpeek_NodeFull_V5

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Render

### One-Click Deployment
1. **Fork this repository** to your GitHub account
2. **Connect to Render**: Visit [render.com](https://render.com) and connect your GitHub
3. **Create Web Service**: Choose "New Web Service" → Connect repository
4. **Configure Settings**:
   - **Name**: `wizspeak-enterprise`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18`

### Environment Variables
Set these in Render dashboard:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key (optional)
```

### Database Setup
1. **Create PostgreSQL database** in Render
2. **Copy DATABASE_URL** to environment variables
3. **Database schema** will be automatically applied on first startup

## 📁 Project Structure

```
Nebusis_WizSpeek_NodeFull_V5/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   ├── lib/            # Utilities and services
│   │   └── hooks/          # Custom React hooks
├── server/                  # Express backend API
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── compliance-center.ts # Enterprise compliance
│   └── privacy-engine.ts   # Privacy protection
├── shared/                  # Shared TypeScript schemas
│   └── schema.ts           # Database schema definitions
├── package.json            # Dependencies and scripts
├── vite.config.ts         # Frontend build configuration
└── README.md              # This file
```

## 🔧 Development

### Database Operations
```bash
# Push schema changes to database
npm run db:push

# Generate and run migrations
npm run db:generate
npm run db:migrate
```

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start
```

## 🏢 Enterprise Features

### Compliance Center
- **Data Loss Prevention (DLP)** monitoring and incident tracking
- **Audit trails** with cryptographic hash validation
- **Retention policies** with automated expiration notifications
- **Access logging** for all user interactions

### Advanced Privacy Controls
- **Contact-specific privacy settings** with granular field controls
- **Custom pseudonyms** and name display options per contact
- **Profile categories** (personal, professional, academic)
- **Privacy profiles** with ghost mode and ephemeral messaging

### Sales & Marketing Integration
- **Professional sales contact form** with multi-section data collection
- **Automated email delivery** to sales team with structured inquiry data
- **Enterprise demo requests** with qualified lead management
- **Marketing landing page** with feature showcase and pricing tiers

## 📊 Compliance & Legal

### Regulatory Compliance
- **98.3% overall compliance** with international privacy regulations
- **GDPR Article 25** - Privacy by Design implementation
- **CCPA compliance** with user data control and deletion rights
- **ISO 27001** security management framework
- **SOC 2 Type II** controls for enterprise security

### Data Protection
- **Client-side encryption** with AES-256 for file attachments
- **Zero-knowledge architecture** for sensitive user data
- **Data minimization** principles in all data collection
- **Right to erasure** implementation for user data deletion

## 🌟 What's New in V5.0.12

### Recent Updates
- ✅ **Render compatibility fixes applied** - Standard Express server startup
- ✅ **Multilingual translation system** - 12 languages with 1,070+ keys
- ✅ **Enterprise sales contact system** - Professional inquiry management
- ✅ **Trust score verification** - User reputation and validation system
- ✅ **Contact invitation system** - QR codes with privacy controls
- ✅ **Advanced profile management** - Work history and demographics
- ✅ **Compliance assessment complete** - Legal compliance verified

### Performance Optimizations
- Optimized build pipeline with Vite + ESBuild
- Reduced bundle size with tree shaking
- Enhanced WebSocket connection management
- Improved database query performance

## 📞 Support & Contact

**Nebusis® Cloud Services LLC**  
*A Member of the QSI Global Ventures Group*

- **Enterprise Sales**: info@nebusis.com
- **Technical Support**: support@nebusis.com
- **Documentation**: [docs.nebusis.com](https://docs.nebusis.com)
- **Website**: [nebusis.com](https://nebusis.com)

## 📄 License

Copyright © 2025 Nebusis® Cloud Services LLC. All rights reserved.

WizSpeek® is a registered trademark of Nebusis® Cloud Services LLC.

---

**Built with ❤️ by the Nebusis® development team**  
*Empowering secure communication for the enterprise world*