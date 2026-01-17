# VibeBOT v2.3 - Landing Page

Professional landing page for VibeBOT v2.3 advanced crypto trading bot.

## 🚀 Quick Start

Open `index.html` in your browser - that's it! No build process required.

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## 📁 Project Structure

```
OrangePulseBot/
├── index.html           # Main landing page
├── styles.css           # Premium dark theme styles
├── script.js            # Interactive functionality
├── OrangePulseBot.md    # Pine Script source code
├── VibeBot v2.3 User Manual.pdf  # Comprehensive user guide
└── README.md            # This file
```

## ✨ Features

- **Premium Dark Design**: Glassmorphism effects, neon accents, smooth gradients
- **Fully Responsive**: Mobile-first design, works perfectly on all devices
- **Interactive**: Strategy tabs, FAQ accordion, scroll animations
- **SEO Optimized**: Meta tags, semantic HTML, fast loading
- **Accessible**: WCAG AA compliant, keyboard navigation
- **Zero Dependencies**: Vanilla HTML/CSS/JS - no frameworks needed

## 🎨 Design Highlights

- **Color Palette**: Dark theme (#0a0e1a) with accent colors (green #00ff88, orange #ff6b00, purple #8b5cf6)
- **Typography**: Inter (primary) + JetBrains Mono (code)
- **Effects**: Glassmorphism, smooth animations, parallax hero
- **Sections**: 10 main sections from Hero to Footer

## 📄 Sections

1. **Hero** - Impactful headline with animated stats
2. **Features** - 4 feature cards (Multi-Strategy, DCA, Exits, Tools)
3. **Strategies** - Interactive tabs for 4 entry modes
4. **DCA System** - Visual ladder explanation
5. **Risk Management** - 3-column protection overview
6. **Integration** - TradingView, WunderTrading, 3Commas
7. **FAQ** - 8 common questions with accordion
8. **Contact/CTA** - Newsletter signup + downloads
9. **Footer** - Links and legal info

## 🛠️ Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --accent-green: #00ff88;
    --accent-orange: #ff6b00;
    /* ... */
}
```

### Content
All content is in `index.html` - search for section IDs:
- `#hero` - Hero section
- `#features` - Features grid
- `#strategies` - Strategy showcase
- etc.

### Links
Update download links in Contact section:
```html
<a href="VibeBot v2.3 User Manual.pdf" download>
<a href="OrangePulseBot.md" download>
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## 🚀 Deployment

### Option 1: GitHub Pages
```bash
# Push to GitHub, enable Pages in Settings
# Your site will be at: https://username.github.io/OrangePulseBot
```

### Option 2: Netlify/Vercel
1. Drag & drop the folder
2. Auto-deployed in seconds
3. Free SSL + CDN included

### Option 3: Traditional Hosting
Upload all files to your web server via FTP/SFTP.

## 🔧 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, SEO, Accessibility)
- **Page Weight**: < 100KB (HTML+CSS+JS)
- **Load Time**: < 1s on fast connection
- **No external dependencies**: Except Google Fonts

## 🎯 SEO Checklist

- ✅ Meta tags (description, keywords, OG)
- ✅ Semantic HTML5 structure
- ✅ Unique H1 per page
- ✅ Alt text ready (add when images added)
- ✅ Fast loading
- ✅ Mobile-friendly
- ✅ Schema.org markup ready

## 📝 TODO / Future Enhancements

- [ ] Add actual trading chart screenshots
- [ ] Create logo/favicon
- [ ] Add video demo section
- [ ] Implement backend for newsletter (Mailchimp/ConvertKit)
- [ ] Add testimonials with real user data
- [ ] Create blog section
- [ ] Add live TradingView widget
- [ ] Integrate Telegram/Discord community links
- [ ] Add CMS (optional - Contentful, Strapi)
- [ ] Multi-language support (Slovenian)

## 🤝 Contributing

This is a landing page for VibeBOT v2.3. For the actual bot:
- Pine Script: `OrangePulseBot.md`
- Manual: `VibeBot v2.3 User Manual.pdf`

## ⚠️ Disclaimer

Trading cryptocurrencies involves substantial risk of loss. VibeBOT is a tool to assist your trading strategy, not financial advice. Always use proper risk management.

## 📧 Contact

Update contact information in the footer and contact section of `index.html`.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Built with**: ❤️ and Vanilla JS
