import 'dart:convert'; // Pour convertir les données JSON en objets Dart et vice versa
import 'dart:io'; // Pour gérer les entrées/sorties, notamment les requêtes HTTP
import 'package:http/http.dart' as http; // Pour effectuer des requêtes HTTP (GET, POST, etc.)
 
 // obtinet des produit
Future<void> getProducts(String baseUrl) async {
  final response = await http.get(Uri.parse('$baseUrl/products'));

  if (response.statusCode == 200) {
    List<dynamic> products = jsonDecode(response.body);
    print('Produits disponibles:');
    for (var product in products) {
      print('Nom: ${product['name']}, Prix: ${product['price']}');
    }
  } else {
    print('Erreur lors de la récupération des produits');
  }
}

// ajouter noveau produit

Future<void> addProduct(String baseUrl, String name, double price) async {
  final product = {'name': name, 'price': price};
  final response = await http.post(
    Uri.parse('$baseUrl/products'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(product),
  );

  if (response.statusCode == 201) {
    print('Produit ajouté avec succès');
  } else {
    print('Erreur lors de l\'ajout du produit');
  }
}





// les commandees 

Future<void> getOrders(String baseUrl) async {
  final response = await http.get(Uri.parse('$baseUrl/orders'));
  
  if (response.statusCode == 200) {
    print('\n=== COMMANDES ===');
    jsonDecode(response.body).forEach((order) {
      print('${order['product']} x${order['quantity']}');
    });
  } else {
    print('Erreur ${response.statusCode}');
  }
}

Future<void> addOrder(String baseUrl, String productName, int quantity) async {
  final response = await http.post(
    Uri.parse('$baseUrl/orders'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'product': productName, 'quantity': quantity}),
  );
  
  print(response.statusCode == 201 
      ? '✅ Commande créée' 
      : '❌ Erreur ${response.statusCode}');
}

// exection

void main() async {
  const baseUrl = 'http://localhost:3000';
  
  // Test complet
  print('\n=== TEST COMPLET ===');
  await getProducts(baseUrl);
  await addProduct(baseUrl, 'Nouveau Produit', 29.99);
  await addOrder(baseUrl, 'Nouveau Produit', 3);
  await getProducts(baseUrl);
  await getOrders(baseUrl);
}