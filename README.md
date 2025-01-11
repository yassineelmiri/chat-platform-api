# Chat Platform API

![image](https://github.com/user-attachments/assets/3ff30c00-00ab-4d09-a7eb-3c0658001f51)


La **Chat Platform API** est une solution backend robuste pour une plateforme de messagerie en temps réel. Elle prend en charge des fonctionnalités telles que les canaux de discussion, les messages privés, les notifications en temps réel et bien plus.

---

## 🌟 Fonctionnalités principales

- **Messagerie en temps réel** : WebRTC et WebSocket pour des échanges fluides.
- **Discussions privées** : Messages entre utilisateurs connectés via le système d'amis.
- **Système d'amis** : Ajout, gestion et notifications des demandes.
- **Canaux de discussion** :
  - Publics et privés.
  - Gestion des membres et des permissions.
  - Création de canaux temporaires.
- **Notifications en temps réel** : Pour les invitations, demandes d'amis et messages.
- **Modération** :
  - Ban utilisateur : Accès restreint définitif.
  - Bounce utilisateur : Suspension de 24h.
- **Sauvegarde et métriques** :
  - Enregistrement des sessions publiques.
  - Analyse des mots-clés fréquemment utilisés.

---

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- Docker (facultatif pour la conteneurisation)
- MongoDB ou PostgreSQL

### Étapes d'installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/yassineelmiri/chat-platform-api.git
   cd chat-platform-api
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement dans `.env` :
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   ```

4. Lancez l'application :
   ```bash
   npm run start:dev
   ```

5. L'API sera accessible à [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests

- Exécutez les tests unitaires et d'intégration :
  ```bash
  npm run test
  ```

---

## 📖 Documentation

La documentation Swagger est accessible à : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠️ Technologies utilisées

- **Backend** : [NestJS](https://nestjs.com/)
- **Protocole** : WebSocket et REST API
- **Tests** : Jest, Supertest
- **Conteneurisation** : Docker

---

## 🤝 Contribution

Les contributions sont bienvenues. Suivez ces étapes :
1. Forkez le dépôt.
2. Créez une branche :
   ```bash
   git checkout -b feature/nom-fonctionnalite
   ```
3. Soumettez une Pull Request.
