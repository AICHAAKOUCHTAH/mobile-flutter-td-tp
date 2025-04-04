 import 'package:intl/intl.dart';

class Commande {
  final int id;
  final DateTime date;
  final List<ItemCommande> items;
  final double total;
  final String statut;

  Commande({
    required this.id,
    required this.date,
    required this.items,
    required this.total,
    required this.statut,
  });

  factory Commande.fromJson(Map<String, dynamic> json) {
    return Commande(
      id: json['id'],
      date: DateTime.parse(json['date']),
      items: (json['items'] as List)
          .map((item) => ItemCommande.fromJson(item))
          .toList(),
      total: json['total'].toDouble(),
      statut: json['statut'],
    );
  }

  String get dateFormatee => DateFormat('dd/MM/yyyy HH:mm').format(date);
}

class ItemCommande {
  final int produitId;
  final String nom;
  final double prix;
  final int quantite;

  ItemCommande({
    required this.produitId,
    required this.nom,
    required this.prix,
    required this.quantite,
  });

  factory ItemCommande.fromJson(Map<String, dynamic> json) {
    return ItemCommande(
      produitId: json['produitId'],
      nom: json['nom'],
      prix: json['prix'].toDouble(),
      quantite: json['quantite'],
    );
  }
}