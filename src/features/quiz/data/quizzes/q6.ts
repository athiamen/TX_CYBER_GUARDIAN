import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q6: QuizCatalogEntry = {
  title: 'Firewall Defender',
  module: 'Defense active',
  questions: [
    q('Q6-1', 'Protection active', 'Quel est le role du joueur dans Firewall Defender ?', ['Programmer un serveur DNS', 'Deplacer un coffre pour proteger les donnees', 'Configurer un VPN entreprise'], 1),
    q('Q6-2', 'Protection active', 'Que se passe-t-il si une menace est attrapee ou qu une donnee va au pirate ?', ['Le score est double automatiquement', 'Le niveau suivant se debloque', 'Le bouclier diminue et peut faire perdre une vie'], 2),
    q('Q6-3', 'Protection active', 'Quel objet peut tomber du ciel dans Firewall Defender ?', ['Des donnees personnelles', 'Des voitures de course', 'Des livres scolaires'], 0),
    q('Q6-4', 'Protection active', 'Quel bonus est mentionne dans le document ?', ['Acces root permanent', 'Bouclier ou vie supplementaire via 2FA', 'Suppression totale des menaces'], 1),
    q('Q6-5', 'Protection active', 'Que doit faire le joueur pendant toute la partie ?', ['Attendre sans bouger', 'Donner les donnees au pirate', 'Agir vite et proteger les donnees'], 2),
    q('Q6-6', 'Protection active', 'Quelle donnee numerique est sensible et ne doit pas etre partagee au hasard ?', ['Ton adresse email', 'Le fond d ecran', 'Le pseudo d un jeu hors-ligne'], 0),
    q('Q6-7', 'Protection active', 'Dans Firewall Defender, quelle information scolaire doit rester protegee ?', ['Nom de l ecole et classe', 'Couleur du cartable', 'Marque des chaussures'], 0),
    q('Q6-8', 'Protection active', 'Quelle information de naissance est consideree comme personnelle ?', ['Date de naissance complete', 'Saison preferee', 'Mois des vacances'], 0),
  ],
};
