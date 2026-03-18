import type { QuizDefinition } from './quizCatalog';

export const QUIZ_CATALOG_BY_ID: Record<string, Omit<QuizDefinition, 'id'>> = {
  Q1: {
    title: 'Maitre des Mots de Passe',
    module: 'Cyber Heros',
    questions: [
      {
        id: 'Q1-1',
        module: 'Mots de passe',
        prompt: 'Quel mot de passe est le plus amusant et securise ?',
        options: ['LicorneMagique2024!', 'password', '12345'],
        correctIndex: 0,
      },
      {
        id: 'Q1-2',
        module: 'Mots de passe',
        prompt: 'Quelle pratique est explicitement deconseillee dans le jeu ?',
        options: [
          'Ne jamais partager son mot de passe',
          'Ecrire son mot de passe sur un post-it visible',
          'Creer des mots de passe differents selon les services',
        ],
        correctIndex: 1,
      },
      {
        id: 'Q1-3',
        module: 'Mots de passe',
        prompt: 'Quel mot de passe est le plus faible ?',
        options: ['SoleilBleu#2026', 'ChatRouge!84', 'azerty'],
        correctIndex: 2,
      },
      {
        id: 'Q1-4',
        module: 'Mots de passe',
        prompt: 'Pourquoi faut-il utiliser des mots de passe differents selon les sites ?',
        options: [
          'Pour empecher qu un seul piratage compromette tous les comptes',
          'Pour aller plus vite a la connexion',
          'Pour aider les amis a s en souvenir',
        ],
        correctIndex: 0,
      },
      {
        id: 'Q1-5',
        module: 'Mots de passe',
        prompt: 'Quel element rend un mot de passe plus robuste ?',
        options: ['Seulement le prenom', 'Une combinaison de lettres, chiffres et symboles', 'Le meme code PIN que sur le telephone'],
        correctIndex: 1,
      },
    ],
  },
  Q2: {
    title: 'Detecteur de Pieges',
    module: 'Cyber Heros',
    questions: [
      { id: 'Q2-1', module: 'Phishing', prompt: 'Quel indice est cite comme signal de phishing dans le document ?', options: ['Message courtois sans lien', 'Email interne attendu', 'Adresse suspecte et urgence exageree'], correctIndex: 2 },
      { id: 'Q2-2', module: 'Phishing', prompt: 'Dans Detecteur de Pieges, que fait le joueur ?', options: ['Il choisit si le message est sur ou suspect', 'Il installe un antivirus sur serveur', 'Il change ses droits administrateur'], correctIndex: 0 },
      { id: 'Q2-3', module: 'Phishing', prompt: 'Quel message doit sembler suspect ?', options: ['Voici le devoir pour demain', 'Tu as gagne un cadeau, clique vite ici', 'Rendez-vous confirme a 15h'], correctIndex: 1 },
      { id: 'Q2-4', module: 'Phishing', prompt: 'Que faut-il verifier dans un email douteux ?', options: ['La couleur de l ecran', 'Le niveau de batterie', 'L adresse de l expediteur'], correctIndex: 2 },
      { id: 'Q2-5', module: 'Phishing', prompt: 'Quelle reaction est la plus sure face a un lien suspect ?', options: ['Ne pas cliquer et demander de l aide', 'Cliquer pour voir si c est vrai', 'Envoyer le lien a tous ses amis'], correctIndex: 0 },
    ],
  },
  Q3: {
    title: 'Le Royaume des Mots de Passe',
    module: 'Protection des comptes',
    questions: [
      { id: 'Q3-1', module: 'Construction de mot de passe', prompt: 'Combien d etapes composent la quete du Royaume des Mots de Passe ?', options: ['3 etapes', '6 etapes', '10 etapes'], correctIndex: 1 },
      { id: 'Q3-2', module: 'Construction de mot de passe', prompt: 'Quel mecanisme est present dans ce jeu pour evaluer la qualite du mot de passe ?', options: ['Un scan reseau en temps reel', 'Un pare-feu materiel', 'Une jauge de securite dynamique'], correctIndex: 2 },
      { id: 'Q3-3', module: 'Construction de mot de passe', prompt: 'Quelle suite fait partie de la quete selon le document ?', options: ['animal, couleur, melodie, chiffres, symboles', 'ville, pays, continent', 'email, telephone, adresse'], correctIndex: 0 },
      { id: 'Q3-4', module: 'Construction de mot de passe', prompt: 'Quel bonus peut etre gagne dans les mini-jeux ?', options: ['Un acces administrateur', 'Un caractere special supplementaire', 'La suppression du mot de passe'], correctIndex: 1 },
      { id: 'Q3-5', module: 'Construction de mot de passe', prompt: 'A la fin du jeu, que peut voir le joueur ?', options: ['Une liste de serveurs reseau', 'Les mots de passe des autres joueurs', 'Le mot de passe final avec un certificat'], correctIndex: 2 },
    ],
  },
  Q4: {
    title: 'Chat Guardian',
    module: 'Messagerie securisee',
    questions: [
      { id: 'Q4-1', module: 'Messagerie', prompt: 'Quel type de situation fait partie des scenarios Chat Guardian ?', options: ['Arnaque au faux concours avec demande de code SMS', 'Configuration d un routeur entreprise', 'Mise a jour d une base SQL'], correctIndex: 0 },
      { id: 'Q4-2', module: 'Messagerie', prompt: 'Quelle action est proposee dans le jeu face a un contact dangereux ?', options: ['Partager son numero pour verifier', 'Bloquer ou signaler le contact', 'Ignorer les preuves et supprimer le chat'], correctIndex: 1 },
      { id: 'Q4-3', module: 'Messagerie', prompt: 'Quel scenario est cite dans Chat Guardian ?', options: ['Installation d imprimante', 'Configuration du Wi-Fi', 'Cyberharcelement avec insultes et menaces'], correctIndex: 2 },
      { id: 'Q4-4', module: 'Messagerie', prompt: 'Que faut-il faire si un message met mal a l aise ?', options: ['Demander de l aide a un adulte', 'Continuer la discussion en secret', 'Envoyer une photo en reponse'], correctIndex: 0 },
      { id: 'Q4-5', module: 'Messagerie', prompt: 'Quel indice est un signal d alerte dans une conversation ?', options: ['Un ami qui dit bonjour', 'Une demande de secret ou de photo', 'Une invitation a faire ses devoirs'], correctIndex: 1 },
    ],
  },
  Q5: {
    title: 'Le Labyrinthe des Infos',
    module: 'Protection des donnees personnelles',
    questions: [
      { id: 'Q5-1', module: 'Donnees personnelles', prompt: 'Quel element fait partie des mecaniques du Labyrinthe des Infos ?', options: ['Compilation de code en temps reel', 'Mode multijoueur en equipe reseau', 'Inventaire des donnees sensibles protegees/compromises'], correctIndex: 2 },
      { id: 'Q5-2', module: 'Donnees personnelles', prompt: 'Quel bilan final peut apparaitre dans ce jeu ?', options: ['Maitre de la cybersecurite', 'Administrateur systeme certifie', 'Root kernel valide'], correctIndex: 0 },
      { id: 'Q5-3', module: 'Donnees personnelles', prompt: 'Combien de vies le joueur a-t-il au depart ?', options: ['2', '5', '10'], correctIndex: 1 },
      { id: 'Q5-4', module: 'Donnees personnelles', prompt: 'Quelle situation est presentee dans le labyrinthe ?', options: ['Une mise a jour BIOS', 'Une panne de clavier', 'Un faux concours iPhone'], correctIndex: 2 },
      { id: 'Q5-5', module: 'Donnees personnelles', prompt: 'Quelle donnee faut-il proteger dans ce jeu ?', options: ['Adresse et numero de telephone', 'Couleur preferee seulement', 'Nom du dessin anime prefere'], correctIndex: 0 },
    ],
  },
  Q6: {
    title: 'Firewall Defender',
    module: 'Defense active',
    questions: [
      { id: 'Q6-1', module: 'Protection active', prompt: 'Quel est le role du joueur dans Firewall Defender ?', options: ['Programmer un serveur DNS', 'Deplacer un coffre pour proteger les donnees', 'Configurer un VPN entreprise'], correctIndex: 1 },
      { id: 'Q6-2', module: 'Protection active', prompt: 'Que se passe-t-il si une menace est attrapee ou qu une donnee va au pirate ?', options: ['Le score est double automatiquement', 'Le niveau suivant se debloque', 'Le bouclier diminue et peut faire perdre une vie'], correctIndex: 2 },
      { id: 'Q6-3', module: 'Protection active', prompt: 'Quel objet peut tomber du ciel dans Firewall Defender ?', options: ['Des donnees personnelles', 'Des voitures de course', 'Des livres scolaires'], correctIndex: 0 },
      { id: 'Q6-4', module: 'Protection active', prompt: 'Quel bonus est mentionne dans le document ?', options: ['Acces root permanent', 'Bouclier ou vie supplementaire via 2FA', 'Suppression totale des menaces'], correctIndex: 1 },
      { id: 'Q6-5', module: 'Protection active', prompt: 'Que doit faire le joueur pendant toute la partie ?', options: ['Attendre sans bouger', 'Donner les donnees au pirate', 'Agir vite et proteger les donnees'], correctIndex: 2 },
    ],
  },
};
