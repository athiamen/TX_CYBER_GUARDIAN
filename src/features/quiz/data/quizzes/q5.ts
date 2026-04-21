import { q, type QuizCatalogEntry } from './types';

export const QUIZ_Q5: QuizCatalogEntry = {
  title: 'Le Labyrinthe des Infos',
  module: 'Protection des donnees personnelles',
  questions: [
    q('Q5-1', 'Donnees personnelles', 'Quel element fait partie des mecaniques du Labyrinthe des Infos ?', ['Compilation de code en temps reel', 'Mode multijoueur en equipe reseau', 'Inventaire des donnees sensibles protegees/compromises'], 2),
    q('Q5-2', 'Donnees personnelles', 'Quel bilan final peut apparaitre dans ce jeu ?', ['Maitre de la cybersecurite', 'Administrateur systeme certifie', 'Root kernel valide'], 0),
    q('Q5-3', 'Donnees personnelles', 'Combien de vies le joueur a-t-il au depart ?', ['2', '5', '10'], 1),
    q('Q5-4', 'Donnees personnelles', 'Quelle situation est presentee dans le labyrinthe ?', ['Une mise a jour BIOS', 'Une panne de clavier', 'Un faux concours iPhone'], 2),
    q('Q5-5', 'Donnees personnelles', 'Quelle donnee faut-il proteger dans ce jeu ?', ['Adresse et numero de telephone', 'Couleur preferee seulement', 'Nom du dessin anime prefere'], 0),
  ],
};
