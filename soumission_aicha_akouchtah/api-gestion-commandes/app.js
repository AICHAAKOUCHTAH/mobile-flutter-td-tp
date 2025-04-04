const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());

// Chemins des fichiers
const dataDir = path.join(__dirname, 'data');
const produitsPath = path.join(dataDir, 'produits.json');
const commandesPath = path.join(dataDir, 'commandes.json');

// Initialisation des fichiers et dossier
const initFiles = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    if (!fs.existsSync(produitsPath)) {
      fs.writeFileSync(produitsPath, '[]', 'utf8');
    }
    
    if (!fs.existsSync(commandesPath)) {
      fs.writeFileSync(commandesPath, '[]', 'utf8');
    }
  } catch (err) {
    console.error('Erreur lors de l\'initialisation des fichiers:', err);
    process.exit(1);
  }
};
initFiles();

// Helpers
const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Erreur lecture ${filePath}:`, err);
    return [];
  }
};

const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Erreur écriture ${filePath}:`, err);
  }
};

// Custom Errors
class StockInsuffisantError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StockInsuffisantError';
    this.statusCode = 400;
  }
}

class ProduitNonTrouveError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProduitNonTrouveError';
    this.statusCode = 404;
  }
}

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: "API de gestion de produits et commandes",
    endpoints: {
      produits: {
        GET: "/api/produits",
        POST: "/api/produits"
      },
      commandes: {
        GET: "/api/commandes",
        POST: "/api/commandes"
      }
    }
  });
});

// Routes Produits
app.get('/api/produits', (req, res) => {
  try {
    const produits = readJson(produitsPath);
    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/produits', (req, res) => {
  try {
    const { nom, prix, stock } = req.body;
    
    if (!nom || !prix || !stock) {
      return res.status(400).json({ error: "Nom, prix et stock requis" });
    }

    const produits = readJson(produitsPath);
    const newProduct = { 
      id: produits.length > 0 ? Math.max(...produits.map(p => p.id)) + 1 : 1,
      nom,
      prix: Number(prix),
      stock: Number(stock),
      createdAt: new Date().toISOString()
    };
    
    produits.push(newProduct);
    writeJson(produitsPath, produits);
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Routes Commandes
app.get('/api/commandes', (req, res) => {
  try {
    const commandes = readJson(commandesPath);
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/commandes', (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items invalides" });
    }

    const produits = readJson(produitsPath);
    const commandes = readJson(commandesPath);
    let total = 0;
    const produitsCommandes = [];

    // Validation et préparation des produits
    for (const item of items) {
      const produit = produits.find(p => p.id === item.produitId);
      
      if (!produit) {
        throw new ProduitNonTrouveError(`Produit ${item.produitId} introuvable`);
      }
      
      if (produit.stock < item.quantite) {
        throw new StockInsuffisantError(`Stock insuffisant pour ${produit.nom}`);
      }

      total += produit.prix * item.quantite;
      produitsCommandes.push({
        produitId: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: item.quantite
      });
      
      // Mise à jour du stock
      produit.stock -= item.quantite;
    }

    // Création de la commande
    const newCommande = {
      id: commandes.length > 0 ? Math.max(...commandes.map(c => c.id)) + 1 : 1,
      date: new Date().toISOString(),
      items: produitsCommandes,
      total,
      statut: "en cours"
    };

    commandes.push(newCommande);
    writeJson(produitsPath, produits);
    writeJson(commandesPath, commandes);

    res.status(201).json(newCommande);

  } catch (err) {
    if (err instanceof StockInsuffisantError || err instanceof ProduitNonTrouveError) {
      res.status(err.statusCode).json({ error: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint non trouvé" });
});

// Démarrer le serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\nAPI démarrée sur http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`- GET /`);
  console.log(`- GET /api/produits`);
  console.log(`- POST /api/produits`);
  console.log(`- GET /api/commandes`);
  console.log(`- POST /api/commandes\n`);
});