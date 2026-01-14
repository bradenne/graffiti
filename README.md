# graffiti 🎨

> Du street art sur un mur de commits.

Ce dépôt ne contient (presque) rien… sauf ~770 commits vides, soigneusement antidatés
pour peindre sur mon [graphe de contributions GitHub](https://github.com/bradenne) :

```
2026 — <-- BRA --> jusqu'à fin septembre

 ····█·····█████··█████···████······█················
 ···██·····██··██·██··██·██··██·····██···············
 ··███·····██··██·██··██·██··██·····███··············
 ·███████··█████··█████··██████··███████·············
···███·····██··██·██·██··██··██·····███··············
····██·····██··██·██··██·██··██·····██·············· 
·····█·····█████··██··██·██··██·····█··············· 
```

## Comment ça marche

Le graphe GitHub est une grille de 7 lignes (dimanche → samedi) par ~53 colonnes (semaines).
Chaque case allumée reçoit entre 1 et 12 commits vides datés à midi UTC. Le nombre est tiré
au hasard (graine = la date, donc reproductible) : les cases se répartissent sur les quatre
nuances de vert du graphe.

```bash
node paint.ts preview   # aperçu dans le terminal
node paint.ts paint     # génère les commits dans le dépôt courant
```

Les motifs (lettres et flèches) sont définis en ASCII directement dans `paint.ts`, exécuté nativement par Node.js ≥ 23.6 (aucune dépendance).

---

*Pourquoi ? Parce que mes vrais projets sont privés, et qu'un mur vide, c'est triste.*
