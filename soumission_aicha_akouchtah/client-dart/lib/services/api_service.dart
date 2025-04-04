import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/produit.dart';
import '../models/commande.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  // Gestion des produits
  static Future<List<Produit>> getProduits() async {
    final response = await http.get(Uri.parse('$baseUrl/produits'));
    if (response.statusCode == 200) {
      return (jsonDecode(response.body) as List)
          .map((json) => Produit.fromJson(json))
          .toList();
    }
    throw Exception('Échec du chargement des produits');
  }

  static Future<Produit> addProduit(Produit produit) async {
    final response = await http.post(
      Uri.parse('$baseUrl/produits'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(produit.toJson()),
    );
    if (response.statusCode == 201) {
      return Produit.fromJson(jsonDecode(response.body));
    }
    throw Exception('Échec de l\'ajout du produit');
  }

  // Gestion des commandes
  static Future<List<Commande>> getCommandes() async {
    final response = await http.get(Uri.parse('$baseUrl/commandes'));
    if (response.statusCode == 200) {
      return (jsonDecode(response.body) as List)
          .map((json) => Commande.fromJson(json))
          .toList();
    }
    throw Exception('Échec du chargement des commandes');
  }

  static Future<Commande> createCommande(List<Map<String, dynamic>> items) async {
    final response = await http.post(
      Uri.parse('$baseUrl/commandes'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'items': items}),
    );

    if (response.statusCode == 201) {
      return Commande.fromJson(jsonDecode(response.body));
    } else if (response.statusCode == 400) {
      throw StockInsuffisantException(jsonDecode(response.body)['error']);
    } else {
      throw Exception('Échec de la création de commande');
    }
  }
}

class StockInsuffisantException implements Exception {
  final String message;
  StockInsuffisantException(this.message);

  @override
  String toString() => message;
}