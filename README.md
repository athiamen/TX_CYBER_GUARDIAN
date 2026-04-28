# TX - Application mobile de formation

TX est une application mobile (React Native + Expo) pour suivre des modules, consulter des cours, passer des quiz, gérer son profil et exporter des rapports de progression.

## Fonctionnalites principales

- Authentification: inscription et connexion utilisateur
- Parcours de formation: modules, cours et progression
- Evaluation: quiz interactifs et soumission des reponses
- Profil: consultation et mise a jour des informations utilisateur
- Reporting: export des rapports (CSV/PDF selon backend)
- Internationalisation: ressources FR via i18next

## Stack technique

- Expo SDK 55
- React Native 0.83
- React 19
- TypeScript
- React Navigation (tabs + stack)
- NativeWind
- AsyncStorage
- i18next / react-i18next

## Architecture

Le detail de l'architecture applicative est documente ici:

- [architecture.md](architecture.md)

L'entree principale de l'application est [App.tsx](App.tsx), avec navigation racine dans [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx).

## Prerequis

- Node.js LTS
- npm
- Expo CLI (via npx)
- Android Studio (pour emulateur Android) ou un appareil physique
- Backend API actif

## Installation

```bash
npm install
```

## Configuration de l'API

Le frontend lit l'URL backend depuis la variable d'environnement suivante:

```env
EXPO_PUBLIC_API_URL=http://172.20.10.4:4000/api
```

Fichiers concernes:

- [.env](.env)
- [.env.example](.env.example)

### Important selon votre environnement

- Emulateur Android: localhost est mappe automatiquement vers 10.0.2.2 dans le code API
- Appareil physique: utilisez l'IP LAN de votre machine (pas 127.0.0.1)
- Le backend doit ecouter sur 0.0.0.0:4000 pour etre joignable depuis le reseau local

## Lancer le projet

```bash
npm run start
```

## Lancer avec Docker

Pour démarrer l'application web Expo dans un conteneur :

```bash
docker compose up --build
```

L'application est ensuite disponible sur `http://cyber-guardian-app` si ce nom pointe vers `127.0.0.1` sur votre machine Windows.

Ajoutez cette ligne dans `C:\Windows\System32\drivers\etc\hosts` si besoin :

```text
127.0.0.1 cyber-guardian-app
```

Le service `caddy` sert le site sur le port 80 et relaie vers le conteneur Expo. `EXPO_PUBLIC_API_URL` continue de viser le backend via `host.docker.internal`.

Scripts disponibles:

- npm run start: demarre Expo
- npm run android: build et lance Android
- npm run ios: build et lance iOS
- npm run ios:sim: demarre iOS simulator
- npm run web: lance en mode web
- npm run tunnel: demarre Expo en tunnel

## Structure du projet

```text
src/
  features/
    auth/
    modules/
    profile/
    quiz/
  lib/
    api.ts
    sessionStorage.ts
    learningProgress.ts
  navigation/
  theme/
public/
  locales/
    fr/
android/
```

## Verification TypeScript

```bash
npx tsc --noEmit
```

## Depannage reseau (NetworkError)

Si vous voyez "NetworkError when attempting to fetch resource":

1. Verifiez l'URL API dans [.env](.env)
2. Verifiez que le backend repond sur le port 4000
3. Verifiez que mobile/emulateur et PC sont sur le meme reseau
4. Verifiez le pare-feu Windows (port 4000)
5. Redemarrez Expo avec cache vide:

```bash
npx expo start -c
```

6. Si vous avez change la configuration Android native, rebuild l'application

## Notes

- Le backend n'est pas inclus dans ce workspace; l'application consomme une API externe.
- Les routes attendues sont prefixed par /api (ex: /api/auth/login, /api/modules).
