import '../lib/models/produit.dart';
import '../lib/models/commande.dart';
import '../lib/services/api_service.dart';

void main() async {
  print('=== GESTION DES COMMANDES ===\n');

  try {
    // 1. Récupérer les produits
    final produits = await ApiService.getProduits();
    print('Produits disponibles:');
    produits.forEach((p) => print('${p.id}. ${p.nom} - ${p.prix}DH (Stock: ${p.stock})'));

    // 2. Créer une commande
    print('\nCréation d\'une commande...');
    final nouvelleCommande = await ApiService.createCommande([
      {'produitId': 1, 'quantite': 2},
      {'produitId': 3, 'quantite': 1}
    ]);
    
    print('Commande #${nouvelleCommande.id} créée !');
    print('Total: ${nouvelleCommande.total}DH');
    print('Date: ${nouvelleCommande.dateFormatee}');

    // 3. Lister les commandes
    final commandes = await ApiService.getCommandes();
    print('\nToutes les commandes:');
    commandes.forEach((c) {
      print('\nCommande #${c.id} - ${c.dateFormatee}');
      print('Statut: ${c.statut}');
      c.items.forEach((item) {
        print('${item.nom} x${item.quantite} à ${item.prix}DH');
      });
      print('TOTAL: ${c.total}DH');
    });

  } on StockInsuffisantException catch (e) {
    print('\nERREUR: ${e.message}');
  } catch (e) {
    print('\nERREUR: ${e.toString()}');
  }
}