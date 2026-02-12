/**
 * Banque de citations sur l'apprentissage pour la page d'accueil.
 * Une citation est choisie aléatoirement à chaque chargement de la page.
 */

export const LEARNING_QUOTES = [
  { text: "La vie est un processus d'apprentissage constant.", author: "Léonard de Vinci" },
  { text: "Apprendre n'est pas une course, c'est un voyage.", author: "Confucius" },
  { text: "La curiosité est le moteur de l'apprentissage.", author: "Albert Einstein" },
  { text: "Le savoir est la seule richesse qui s'accroît quand on la partage.", author: "Socrate" },
  { text: "Investis dans ton cerveau, c'est l'actif qui te suivra partout.", author: "Charlie Munger" },
  { text: "Celui qui ouvre une porte d'école ferme une prison.", author: "Victor Hugo" },
  { text: "La formation de l'esprit ne se fait pas en apprenant, mais en méditant ce qu'on a appris.", author: "Sénèque" },
  { text: "La sagesse n'est pas le produit de l'instruction mais de l'effort de toute une vie pour l'acquérir.", author: "Albert Einstein" },
  { text: "Apprendre, c'est ajouter du sens à ce que l'on fait.", author: "John Dewey" },
  { text: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Nelson Mandela" },
  { text: "On apprend tant qu'on croit savoir peu.", author: "Proverbe russe" },
  { text: "Dis-moi et j'oublie. Montre-moi et je me souviens. Implique-moi et je comprends.", author: "Benjamin Franklin" },
  { text: "Le but de l'apprentissage est la croissance, et l'esprit, contrairement au corps, peut continuer à grandir.", author: "Mortimer Adler" },
  { text: "Nul ne peut apprendre à notre place.", author: "Friedrich Nietzsche" },
  { text: "La connaissance parle, mais la sagesse écoute.", author: "Jimi Hendrix" },
]

export function getRandomQuote() {
  const index = Math.floor(Math.random() * LEARNING_QUOTES.length)
  return LEARNING_QUOTES[index]
}
