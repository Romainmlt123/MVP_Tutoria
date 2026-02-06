#!/bin/bash
# Script de démarrage pour TutorIA

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🎓 TutorIA Setup                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Se placer dans le bon dossier
cd "$(dirname "$0")"

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python3 trouvé${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js trouvé ($(node --version))${NC}"

# Créer l'environnement virtuel si nécessaire
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Création de l'environnement virtuel...${NC}"
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances Python si nécessaire
if [ ! -f "venv/.deps_installed" ]; then
    echo -e "${YELLOW}📥 Installation des dépendances Python...${NC}"
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    touch venv/.deps_installed
fi

# Installer les dépendances Node si nécessaire
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📥 Installation des dépendances Node.js...${NC}"
    cd frontend && npm install && cd ..
fi

# Vérifier le fichier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env à partir de .env.example${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  N'oubliez pas de configurer votre clé API dans .env${NC}"
fi

# Créer les dossiers nécessaires
mkdir -p static/graphs

echo ""
echo -e "${GREEN}✅ Installation terminée!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Pour démarrer l'application en mode développement:${NC}"
echo ""
echo -e "  ${GREEN}Terminal 1 (Backend):${NC}"
echo "    cd /root/test_graphique_tutoria"
echo "    source venv/bin/activate"
echo "    python main.py"
echo ""
echo -e "  ${GREEN}Terminal 2 (Frontend React):${NC}"
echo "    cd /root/test_graphique_tutoria/frontend"
echo "    npm run dev"
echo ""
echo -e "${YELLOW}Puis ouvrez:${NC} http://localhost:5173"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Demander si on veut démarrer
read -p "Voulez-vous démarrer TutorIA maintenant? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${GREEN}🚀 Démarrage du backend...${NC}"
    python main.py &
    BACKEND_PID=$!
    sleep 2
    
    echo -e "${GREEN}🚀 Démarrage du frontend React...${NC}"
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}✅ TutorIA est démarré!${NC}"
    echo -e "   Backend: http://localhost:8000"
    echo -e "   Frontend: http://localhost:5173"
    echo ""
    echo "Appuyez sur Ctrl+C pour arrêter"
    
    # Attendre l'arrêt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi
