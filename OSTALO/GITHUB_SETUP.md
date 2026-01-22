# OrangePulse - GitHub Repository Setup

Potrebno je kreirati nov GitHub repository z imenom **OrangePulse**.

## Navodila za kreacijo repositorija:

### Opcija 1: Preko GitHub web vmesnika
1. Pojdi na https://github.com/new
2. **Repository name**: `OrangePulse`
3. **Description**: `VibeBOT v2.3 - Advanced Multi-Strategy DCA Trading Bot Landing Page`
4. **Visibility**: Public ali Private (vaša izbira)
5. **Ne dodajaj** README, .gitignore ali license (že imam lokalno)
6. Klikni **Create repository**

### Opcija 2: Preko GitHub CLI (če imaš nameščeno)
```bash
cd /Users/andrejmezan/GitHub/OrangePulseBot
gh repo create OrangePulse --public --source=. --remote=origin --push
```

## Po kreaciji repositorija:

Izvedi naslednje ukaze za push:
```bash
cd /Users/andrejmezan/GitHub/OrangePulseBot
git remote set-url origin https://github.com/andrejmezan/OrangePulse.git
git push -u origin main
```

## Trenutno stanje Git repositorija:

✅ Git inicializiran
✅ 4 datoteke dodane:
  - index.html (landing page)
  - styles.css (premium dark theme)
  - script.js (interaktivnost)
  - README.md (dokumentacija)

✅ Commit narejen: "Add VibeBOT v2.3 landing page - premium dark theme with interactive features"
✅ Branch: main
✅ Remote dodan: origin → https://github.com/andrejmezan/OrangePulse.git

⏳ Čaka na: Kreacijo GitHub repositorija "OrangePulse"

## Po uspešnem pushu:

Lahko omogočiš **GitHub Pages**:
1. Settings → Pages
2. Source: Deploy from branch
3. Branch: main / root
4. Save
5. Stran bo dostopna na: https://andrejmezan.github.io/OrangePulse
