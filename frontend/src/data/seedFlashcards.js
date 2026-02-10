/**
 * Cartes QCM d'exemple pour génération en un clic (Culture générale, maths, physique, etc.)
 * Chaque objet : { front, choices: [a, b, c, d], correct_index: 0-3, back }
 */

/** 15 cartes pour tester rapidement (utilisé par le bouton « Générer des cartes d'exemple ») */
export const SEED_FLASHCARDS_TEST = [
  { front: "Quelle est la formule de l'aire d'un cercle ?", choices: ['π × r', 'π × r²', '2 × π × r', 'π × d'], correct_index: 1, back: "L'aire d'un cercle est π × r², où r est le rayon. La circonférence est 2πr." },
  { front: "Que vaut cos(0) ?", choices: ['0', '1', '-1', '1/2'], correct_index: 1, back: "cos(0) = 1. En radian, 0 correspond au point (1, 0) sur le cercle trigonométrique." },
  { front: "Quelle est la dérivée de x³ ?", choices: ['3x', '3x²', 'x²', '3x³'], correct_index: 1, back: "La dérivée de xⁿ est n·xⁿ⁻¹. Donc (x³)' = 3x²." },
  { front: "Quelle est l'unité de la force dans le SI ?", choices: ['Joule', 'Newton', 'Pascal', 'Watt'], correct_index: 1, back: "Le newton (N) est l'unité de force : F = m × a." },
  { front: "Quelle loi relie la tension U, l'intensité I et la résistance R ?", choices: ['P = U × I', 'U = R × I', 'E = m × c²', 'F = m × a'], correct_index: 1, back: "Loi d'Ohm : U = R × I (en volts, ohms, ampères)." },
  { front: "Qui a écrit « Les Misérables » ?", choices: ['Émile Zola', 'Victor Hugo', 'Gustave Flaubert', 'Alexandre Dumas'], correct_index: 1, back: "Victor Hugo a publié Les Misérables en 1862." },
  { front: "Quel auteur a écrit « L'Étranger » ?", choices: ['Sartre', 'Camus', 'Céline', 'Malraux'], correct_index: 1, back: "Albert Camus a publié L'Étranger en 1942." },
  { front: "En quelle année a eu lieu la prise de la Bastille ?", choices: ['1788', '1789', '1790', '1792'], correct_index: 1, back: "La prise de la Bastille a lieu le 14 juillet 1789." },
  { front: "Quelle est la capitale de l'Australie ?", choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct_index: 2, back: "Canberra est la capitale fédérale de l'Australie (choisie en 1908)." },
  { front: "Quel continent est le plus peuplé ?", choices: ['Afrique', 'Europe', 'Asie', 'Amérique'], correct_index: 2, back: "L'Asie concentre environ 60 % de la population mondiale." },
  { front: "Quel gaz les plantes absorbent pour la photosynthèse ?", choices: ['Oxygène', 'Azote', 'Dioxyde de carbone', 'Hydrogène'], correct_index: 2, back: "La photosynthèse utilise CO₂ et eau pour produire du glucose et O₂." },
  { front: "Combien de chromosomes ont les cellules humaines (hors gamètes) ?", choices: ['23', '46', '44', '48'], correct_index: 1, back: "Les cellules somatiques humaines ont 46 chromosomes (23 paires). Les gamètes en ont 23." },
  { front: "Que signifie l'acronyme HTML ?", choices: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Model Language'], correct_index: 0, back: "HTML = HyperText Markup Language, langage de balisage pour le web." },
  { front: "Quel langage est souvent utilisé pour le machine learning ?", choices: ['Java', 'C++', 'Python', 'PHP'], correct_index: 2, back: "Python est très utilisé en data science et ML (NumPy, TensorFlow, etc.)." },
  { front: "Qu'est-ce qu'une API ?", choices: ['Un langage de programmation', 'Une interface qui permet à des logiciels de communiquer', 'Un type de base de données', 'Un système d’exploitation'], correct_index: 1, back: "API = Application Programming Interface : interface pour que des programmes échangent des données." },
]

export const SEED_FLASHCARDS = [
  // Maths
  { front: "Quelle est la formule de l'aire d'un cercle ?", choices: ['π × r', 'π × r²', '2 × π × r', 'π × d'], correct_index: 1, back: "L'aire d'un cercle est π × r², où r est le rayon. La circonférence est 2πr." },
  { front: "Que vaut cos(0) ?", choices: ['0', '1', '-1', '1/2'], correct_index: 1, back: "cos(0) = 1. En radian, 0 correspond au point (1, 0) sur le cercle trigonométrique." },
  { front: "Quelle est la dérivée de x³ ?", choices: ['3x', '3x²', 'x²', '3x³'], correct_index: 1, back: "La dérivée de xⁿ est n·xⁿ⁻¹. Donc (x³)' = 3x²." },
  { front: "Combien font 2⁵ ?", choices: ['10', '16', '32', '64'], correct_index: 2, back: "2⁵ = 2×2×2×2×2 = 32." },
  { front: "Quelle est la solution de 2x + 4 = 10 ?", choices: ['x = 2', 'x = 3', 'x = 4', 'x = 6'], correct_index: 1, back: "2x = 10 - 4 = 6, donc x = 3." },
  // Physique
  { front: "Quelle est l'unité de la force dans le SI ?", choices: ['Joule', 'Newton', 'Pascal', 'Watt'], correct_index: 1, back: "Le newton (N) est l'unité de force : F = m × a." },
  { front: "Quelle est la vitesse de la lumière dans le vide (approximative) ?", choices: ['300 000 km/s', '150 000 km/s', '30 000 km/s', '3 000 km/s'], correct_index: 0, back: "La vitesse de la lumière c ≈ 299 792 km/s, souvent arrondie à 300 000 km/s." },
  { front: "Quelle loi relie la tension U, l'intensité I et la résistance R ?", choices: ['P = U × I', 'U = R × I', 'E = m × c²', 'F = m × a'], correct_index: 1, back: "Loi d'Ohm : U = R × I (en volts, ohms, ampères)." },
  { front: "Qu'est-ce que l'accélération de la pesanteur sur Terre (ordre de grandeur) ?", choices: ['9,8 m/s', '9,8 m/s²', '10 m/s', '98 m/s²'], correct_index: 1, back: "g ≈ 9,8 m/s². C'est une accélération (m/s²), pas une vitesse." },
  { front: "Quel gaz est le plus abondant dans l'atmosphère terrestre ?", choices: ['Oxygène', 'Dioxyde de carbone', 'Azote', 'Hydrogène'], correct_index: 2, back: "L'azote (N₂) représente environ 78 % de l'air, l'oxygène environ 21 %." },
  // Français / Littérature
  { front: "Qui a écrit « Les Misérables » ?", choices: ['Émile Zola', 'Victor Hugo', 'Gustave Flaubert', 'Alexandre Dumas'], correct_index: 1, back: "Victor Hugo a publié Les Misérables en 1862." },
  { front: "Quel est le genre du « Cid » de Corneille ?", choices: ['Comédie', 'Tragédie', 'Drame', 'Farce'], correct_index: 1, back: "Le Cid (1637) est une tragi-comédie, souvent classée parmi les tragédies classiques." },
  { front: "Quel mot désigne un récit qui raconte la vie de quelqu'un ?", choices: ['Roman', 'Biographie', 'Nouvelle', 'Essai'], correct_index: 1, back: "Une biographie est un récit de la vie d'une personne (réelle ou fictive)." },
  { front: "Quel temps est utilisé dans « Il partit hier » ?", choices: ['Imparfait', 'Passé composé', 'Passé simple', 'Plus-que-parfait'], correct_index: 2, back: "« Partit » est la 3e personne du singulier du passé simple (partir)." },
  { front: "Quel auteur a écrit « L'Étranger » ?", choices: ['Sartre', 'Camus', 'Céline', 'Malraux'], correct_index: 1, back: "Albert Camus a publié L'Étranger en 1942." },
  // Histoire
  { front: "En quelle année a eu lieu la Révolution française (prise de la Bastille) ?", choices: ['1788', '1789', '1790', '1792'], correct_index: 1, back: "La prise de la Bastille a lieu le 14 juillet 1789." },
  { front: "Qui était le dirigeant de l'URSS pendant la Seconde Guerre mondiale ?", choices: ['Lénine', 'Staline', 'Trotski', 'Khrouchtchev'], correct_index: 1, back: "Staline dirige l'URSS de 1924 à 1953, dont pendant la WWII." },
  { front: "Quel traité a mis fin à la Première Guerre mondiale ?", choices: ['Traité de Rome', 'Traité de Versailles', 'Traité de Maastricht', 'Traité de Tordesillas'], correct_index: 1, back: "Le traité de Versailles (1919) met fin à la Première Guerre mondiale." },
  { front: "En quelle année le mur de Berlin est-il tombé ?", choices: ['1987', '1989', '1990', '1991'], correct_index: 1, back: "Le mur de Berlin tombe le 9 novembre 1989." },
  { front: "Qui a découvert l'Amérique en 1492 (côté européen) ?", choices: ['Vasco de Gama', 'Christophe Colomb', 'Magellan', 'Marco Polo'], correct_index: 1, back: "Christophe Colomb atteint les Amériques en 1492 (îles des Caraïbes)." },
  // Géographie / Culture G
  { front: "Quelle est la capitale de l'Australie ?", choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct_index: 2, back: "Canberra est la capitale fédérale de l'Australie (choisie en 1908)." },
  { front: "Quel est le plus long fleuve du monde ?", choices: ['Nil', 'Amazone', 'Yangtsé', 'Mississippi'], correct_index: 0, back: "Le Nil (environ 6 650 km) est généralement considéré comme le plus long. L'Amazone est le plus gros débit." },
  { front: "Dans quel pays se trouve la tour de Pise ?", choices: ['Espagne', 'France', 'Italie', 'Portugal'], correct_index: 2, back: "La tour de Pise se trouve à Pise, en Toscane (Italie)." },
  { front: "Quel continent est le plus peuplé ?", choices: ['Afrique', 'Europe', 'Asie', 'Amérique'], correct_index: 2, back: "L'Asie concentre environ 60 % de la population mondiale." },
  { front: "Quel océan est le plus grand ?", choices: ['Atlantique', 'Indien', 'Pacifique', 'Arctique'], correct_index: 2, back: "Le Pacifique est le plus vaste océan (environ 165 millions de km²)." },
  // Sciences / Bio
  { front: "Quel organe filtre le sang et produit l'urine ?", choices: ['Cœur', 'Foie', 'Rein', 'Poumon'], correct_index: 2, back: "Les reins filtrent le sang et forment l'urine. Le foie détoxifie et métabolise." },
  { front: "Quel gaz les plantes absorbent pour la photosynthèse ?", choices: ['Oxygène', 'Azote', 'Dioxyde de carbone', 'Hydrogène'], correct_index: 2, back: "La photosynthèse utilise CO₂ et eau pour produire du glucose et O₂." },
  { front: "Combien de chromosomes ont les cellules humaines (hors gamètes) ?", choices: ['23', '46', '44', '48'], correct_index: 1, back: "Les cellules somatiques humaines ont 46 chromosomes (23 paires). Les gamètes en ont 23." },
  { front: "Quel est le plus grand organe du corps humain ?", choices: ['Foie', 'Cœur', 'Peau', 'Intestin'], correct_index: 2, back: "La peau est le plus grand organe (surface d'environ 2 m²)." },
  { front: "Qui a proposé la théorie de l'évolution par sélection naturelle ?", choices: ['Lamarck', 'Darwin', 'Mendel', 'Pasteur'], correct_index: 1, back: "Charles Darwin (avec Wallace) a formalisé la sélection naturelle (L'origine des espèces, 1859)." },
  // Informatique / Culture
  { front: "Que signifie l'acronyme HTML ?", choices: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Model Language'], correct_index: 0, back: "HTML = HyperText Markup Language, langage de balisage pour le web." },
  { front: "Quel langage est souvent utilisé pour le machine learning et la data science ?", choices: ['Java', 'C++', 'Python', 'PHP'], correct_index: 2, back: "Python est très utilisé en data science et ML (librairies comme NumPy, TensorFlow)." },
  { front: "Que fait un algorithme de « tri » ?", choices: ['Supprime les doublons', 'Range des éléments dans un ordre donné', 'Recherche un élément', 'Compresse des données'], correct_index: 1, back: "Un tri range les éléments (ex. par ordre croissant). Ex. : tri bulle, tri fusion." },
  { front: "Qu'est-ce qu'une API ?", choices: ['Un langage de programmation', 'Une interface qui permet à des logiciels de communiquer', 'Un type de base de données', 'Un système d’exploitation'], correct_index: 1, back: "API = Application Programming Interface : interface pour que des programmes échangent des données." },
  { front: "Quel protocole sécurise les connexions web (HTTPS) ?", choices: ['FTP', 'SSL/TLS', 'HTTP', 'SMTP'], correct_index: 1, back: "HTTPS utilise SSL/TLS pour chiffrer la connexion entre le navigateur et le serveur." },
]
