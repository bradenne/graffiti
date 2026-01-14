# graffiti 🎨

> Du street art sur un mur de commits.

Ce dépôt ne contient (presque) rien… sauf ~960 commits vides, soigneusement antidatés
pour peindre sur mon [graphe de contributions GitHub](https://github.com/bradenne) :

```
2026 — trigramme et cap sur la suite

 █████··█████···████················█················
 ██··██·██··██·██··██···············██···············
 ██··██·██··██·██··██···············███··············
 █████··█████··██████··█████████████████·············
·██··██·██·██··██··██···············███··············
·██··██·██··██·██··██···············██··············
·█████··██··██·██··██···············█···············
```

## Comment ça marche

Le graphe GitHub est une grille de 7 lignes (dimanche → samedi) par ~53 colonnes (semaines).
Chaque case allumée reçoit 8 commits vides datés à midi UTC : toutes les cases ont le même
nombre de commits, elles prennent donc toutes la nuance de vert la plus foncée.

```bash
node paint.ts preview   # aperçu dans le terminal
node paint.ts paint     # génère les commits dans le dépôt courant
```

Les motifs (lettres et flèche) sont définis en ASCII directement dans `paint.ts`, exécuté nativement par Node.js ≥ 23.6 (aucune dépendance).

---

*Pourquoi ? Parce que mes vrais projets sont privés, et qu'un mur vide, c'est triste.*
