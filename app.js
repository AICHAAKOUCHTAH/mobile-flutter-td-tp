const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());

// Chemins des fichiers
const produitsPath = path.join(__dirname, 'data', 'produits.json');
const commandesPath = path.join(__dirname, 'data', 'commandes.json');

// Initialisation des fichiers JSON
const initFiles = () => {
  if (!fs.existsSync(produitsPath)) fs.writeFileSync(produitsPath, '[]');
  if (!fs.existsSync(commandesPath)) fs.writeFileSync(commandesPath, '[]');
};
initFiles();

// Helpers
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath));
const writeJson = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Custom Errors
class StockInsuffisantError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StockInsuffisantError';
  }
}

// Routes Produits
app.get('/api/produits', (req, res) => {
  res.json(readJson(produitsPath));
});

app.post('/api/produits', (req, res) => {
  const produits = readJson(produitsPath);
  const newProduct = { id: produits.length + 1, ...req.body };
  produits.push(newProduct);
  writeJson(produitsPath, produits);
  res.status(201).json(newProduct);
});

// Routes Commandes
app.get('/api/commandes', (req, res) => {
  res.json(readJson(commandesPath));
});

app.post('/api/commandes', (req, res) => {
  try {
    const { items } = req.body; // Format: [{produitId: 1, quantite: 2}]
    
    // Validation
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Format invalide" });
    }

    const produits = readJson(produitsPath);
    const commandes = readJson(commandesPath);
    let total = 0;
    const produitsCommandes = [];

    // Traitement de chaque produit
    for (const item of items) {
      const produit = produits.find(p => p.id === item.produitId);
      if (!produit) throw new Error(`Produit ${item.produitId} introuvable`);
      if (produit.stock < item.quantite) {
        throw new StockInsuffisantError(`Stock insuffisant pour ${produit.nom}`);
      }

      // Calcul et mise à jour
      total += produit.prix * item.quantite;
      produitsCommandes.push({
        produitId: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: item.quantite
      });
      produit.stock -= item.quantite;
    }

    // Création commande
    const newCommande = {
      id: commandes.length + 1,
      date: new Date().toISOString(),
      items: produitsCommandes,
      total,
      statut: "en cours"
    };

    commandes.push(newCommande);
    writeJson(produitsPath, produits);
    writeJson(commandesPath, commandes);

    res.status(201).json(newCommande);

  } catch (error) {
    if (error instanceof StockInsuffisantError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`API démarrée sur http://localhost:${PORT}`));