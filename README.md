# 🎬 StreamHub - Plateforme de Streaming Moderne

Une application web moderne pour découvrir et regarder des films et séries, avec une interface utilisateur élégante et des fonctionnalités avancées.

## ✨ Fonctionnalités

### 🎯 **Interface Utilisateur**
- Design moderne avec glassmorphisme et animations fluides
- Thème sombre futuriste avec accents cyan (#00e0ff)
- Interface responsive (desktop, tablette, mobile)
- Navigation intuitive et modal interactif

### 🎬 **Découverte de Contenu**
- **Hero Section** : Film tendance du jour avec image de fond
- **Sidebar** : Top 20 des films tendance (desktop)
- **Grille populaire** : Films populaires avec pagination
- **Recommandations** : Films par catégorie avec scroll horizontal
- **Modal détaillé** : Informations complètes + options de streaming

### 🔗 **APIs Intégrées**
- **TMDB API** : Données de films, images, genres, résumés
- **Streaming Availability API** : Plateformes de streaming disponibles

## 🚀 Démarrage Rapide

### **Méthode 1 : Double-clic**
1. Ouvrez l'explorateur de fichiers
2. Naviguez vers `streamhub/`
3. Double-cliquez sur `index.html`
4. L'application s'ouvre dans votre navigateur

### **Méthode 2 : Serveur local**
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js
npx http-server

# Ouvrez http://localhost:8000
```

## 📁 Structure du Projet

```
streamhub/
├── index.html              # Page principale
├── watch.html              # Page de visualisation
├── README.md               # Documentation
├── .gitignore              # Fichiers à ignorer
└── assets/
    ├── css/
    │   ├── styles.css      # Styles principaux
    │   └── watch.css       # Styles du lecteur vidéo
    ├── js/
    │   ├── app.js          # Logique principale
    │   └── watch.js        # Logique du lecteur vidéo
    └── images/
        └── placeholder-2x3.svg  # Image de fallback
```

## 🎮 Utilisation

### **Navigation**
- **Accueil** : Films populaires et tendances
- **Sidebar** : Top 20 des films tendance (desktop)
- **Offcanvas** : Tendances sur mobile
- **Page de visualisation** : Clic sur n'importe quel film

### **Interactions**
- **Clic sur une carte** : Ouvre la page de visualisation
- **Boutons hero** : "Regarder" (page de visualisation) et "Plus d'infos" (modal)
- **Bouton "Voir Plus"** : Charge plus de films populaires
- **Scroll horizontal** : Dans les recommandations par catégorie

### **Lecteur Vidéo**
- **Contrôles complets** : Play/Pause, volume, progression
- **Raccourcis clavier** : Espace, flèches, F (plein écran), M (muet)
- **Plein écran** : Mode immersif
- **Paramètres** : Qualité, vitesse, sous-titres
- **Informations film** : Cast, description, films similaires

## 🔧 Configuration

### **APIs (Optionnel)**
Pour des données réelles, modifiez dans `assets/js/app.js` :

```javascript
// Clé TMDB (gratuite)
const tmdbApiKey = 'b3ea1ee2890f24b0b24ea90eaead0bf4';

// Clé RapidAPI (Streaming Availability)
const rapidApiKey = '92236bffe9msh94e311761b4836fp198f12jsnfdee98147932';
```

**Note** : L'application fonctionne parfaitement avec les données de démonstration !

## 📱 Responsive Design

L'application s'adapte automatiquement à :
- **Desktop** (>992px) : Layout complet avec sidebar fixe
- **Tablette** (768px-991px) : Grille optimisée sans sidebar
- **Mobile** (<768px) : Interface tactile avec offcanvas

## 🎨 Personnalisation

### **Thème**
Modifiez les variables CSS dans `assets/css/styles.css` :
```css
:root {
  --accent: #00e0ff;        /* Couleur principale */
  --accent-2: #a855f7;      /* Couleur secondaire */
  --bg-primary: #0b0f17;    /* Fond principal */
  --text-primary: #e6eaf2;  /* Texte principal */
}
```

### **Animations**
Ajustez les transitions :
```css
.card {
  transition: transform 180ms ease, box-shadow 180ms ease;
}
```

## 🐛 Dépannage

### **Problème : Films ne s'affichent pas**
- Vérifiez la console (F12) pour les erreurs
- Assurez-vous que les clés API sont correctes
- Vérifiez votre connexion internet

### **Problème : Modal ne s'ouvre pas**
- Vérifiez que Bootstrap est chargé
- Assurez-vous que JavaScript est activé
- Vérifiez les erreurs dans la console

### **Problème : Styles ne se chargent pas**
- Vérifiez que `assets/css/styles.css` existe
- Vérifiez les chemins dans `index.html`
- Essayez de recharger la page (Ctrl+F5)

## 📊 Performance

- **Images optimisées** avec lazy loading
- **CSS optimisé** avec variables et animations GPU
- **JavaScript modulaire** pour un chargement rapide
- **Skeleton loaders** pendant le chargement

## 🌐 Déploiement GitHub Pages

1. **Pousser sur GitHub** :
   ```bash
   git add .
   git commit -m "StreamHub ready for deployment"
   git push origin main
   ```

2. **Activer GitHub Pages** :
   - Aller dans Settings > Pages
   - Source : Deploy from a branch
   - Branch : main / (root)

3. **Accéder au site** :
   `https://votre-username.github.io/streamhub`

## 🔮 Améliorations Futures

- Système de comptes utilisateur
- Listes de favoris personnalisées
- Recommandations basées sur l'historique
- Support offline avec Service Workers
- Intégration avec des services de streaming réels

## 📄 Licence

Ce projet est open source et disponible sous licence MIT.

## 🤝 Contribution

Les suggestions d'amélioration sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

---

**🎬 Profitez de votre expérience de streaming avec StreamHub !**

*Données fournies par [TMDB](https://www.themoviedb.org/) et [Streaming Availability](https://rapidapi.com/movie-of-the-night2/api/streaming-availability)*