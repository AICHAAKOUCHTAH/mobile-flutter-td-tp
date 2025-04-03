class Produit {
  final int id;
  final String nom;
  final double prix;
  final int stock;
  final String categorie;

  Produit({
    required this.id,
    required this.nom,
    required this.prix,
    required this.stock,
    required this.categorie,
  });

  factory Produit.fromJson(Map<String, dynamic> json) {
    return Produit(
      id: json['id'],
      nom: json['nom'],
      prix: json['prix'].toDouble(),
      stock: json['stock'],
      categorie: json['categorie'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nom': nom,
    'prix': prix,
    'stock': stock,
    'categorie': categorie,
  };
}