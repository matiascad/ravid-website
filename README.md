# 🎖️ Tuval Memorial Website

**בסוף הכל יהיה בסדר** - Memorial and lecture booking site for Staff Sergeant Tuval Yaakov Tsanani ז"ל

## 📊 Project Info

- **Speaker**: Ravid Tsanani (Brother)
- **Memorial**: Tuval Yaakov Tsanani ז"ל (20.11.2003 - 04.12.2023)
- **Unit**: Battalion 53, Barak Brigade (188)
- **Role**: Tank Gunner
- **Contact**: [WhatsApp](https://wa.me/972503112243) | [Instagram](https://instagram.com/ravid._.t)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
# Visit: http://localhost:3000
```

## 📦 Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## 📁 Project Structure

```
tuval-memorial-website/
├── app/
│   ├── layout.tsx       # Root layout + SEO
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/
│   └── TuvalMemorialLanding.tsx  # Main component
├── public/
│   └── images/          # Add photos here
├── package.json
├── tailwind.config.js   # Memorial theme
├── next.config.js       # RTL support
└── tsconfig.json
```

## ⚠️ Before Launch

### Must Do:
1. [ ] Add 8-10 real photos to `public/images/`
2. [ ] Fix contact form (add EmailJS) OR remove it
3. [ ] Test on mobile devices
4. [ ] Add favicon.ico

### Should Do:
5. [ ] Test all links (WhatsApp, Instagram)
6. [ ] Verify RTL rendering
7. [ ] Check animations on different browsers

## 📸 Photos Needed

Add these to `public/images/`:

1. `tuval-hero.jpg` - Main hero photo (uniform)
2. `tuval-memory-1.jpg` - Childhood
3. `tuval-memory-2.jpg` - Family
4. `tuval-memory-3.jpg` - Boot camp
5. `tuval-memory-4.jpg` - Unit friends
6. `lecture-1.jpg` - Ravid speaking (Training Base)
7. `lecture-2.jpg` - Ravid speaking (Pre-military)
8. `lecture-3.jpg` - Ravid speaking (Families)

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **RTL**: Full Hebrew support

## 📞 Support

For questions contact Ravid:
- WhatsApp: +972-50-311-2243
- Instagram: @ravid._.t

---

**Built with ❤️ in memory of Tuval ז"ל**  
**"בסוף הכל יהיה בסדר"**
