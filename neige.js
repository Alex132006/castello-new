// Loading screen with restaurant name - show only once
window.addEventListener('load', function () {
    if (!localStorage.getItem('hasSeenLoading')) {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <img src="image copy.png" alt="Логотип Кафе Кастелло Пан Африка" class="loading-logo">
                <h2>добро пожаловать</h2>
                <h3>В</h3>
                <h1>Кастелло Пан Африка</h1>
                <div class="spinner"></div>
                <p>Загрузка...</p>
            </div>
        `;
        loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #442d0a 0%, #d4af37 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Playfair Display', Georgia, serif;
            text-align: center;
        `;
        document.body.appendChild(loadingScreen);

        // Hide loading screen after 3 seconds
        setTimeout(function () {
            loadingScreen.style.opacity = '0';
            setTimeout(function () {
                loadingScreen.remove();
            }, 200);
        }, 900);

        // Mark as seen
        localStorage.setItem('hasSeenLoading', 'true');
    }
});

// Effet de glaces d'hiver (neige) - version continue
function createSnowflakes() {
    const snowContainer = document.createElement('div');
    snowContainer.id = 'snow-container';
    snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
    `;
    document.body.appendChild(snowContainer);

    // Stocker l'intervalle pour pouvoir l'arrêter plus tard
    let snowInterval;

    // Créer les flocons de neige
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.innerHTML = '❄';
        snowflake.style.cssText = `
            position: absolute;
            top: -20px;
            color: white;
            font-size: ${Math.random() * 10 + 10}px;
            opacity: ${Math.random() * 0.6 + 0.3};
            user-select: none;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        `;
        
        snowContainer.appendChild(snowflake);
        
        // Position horizontale aléatoire
        const startPosition = Math.random() * window.innerWidth;
        const animationDuration = Math.random() * 5 + 5; // 5-10 seconds
        const swayAmplitude = (Math.random() - 0.5) * 100; // Mouvement latéral aléatoire gauche/droite
        
        snowflake.style.left = startPosition + 'px';
        
        // Animation de chute
        const fallAnimation = snowflake.animate([
            { 
                transform: `translateX(0px) translateY(0px) rotate(0deg)`,
                opacity: snowflake.style.opacity
            },
            { 
                transform: `translateX(${swayAmplitude}px) translateY(${window.innerHeight + 50}px) rotate(360deg)`,
                opacity: '0'
            }
        ], {
            duration: animationDuration * 1000,
            easing: 'linear'
        });
        
        // Supprimer le flocon après l'animation
        fallAnimation.onfinish = () => {
            if (snowflake.parentNode) {
                snowflake.remove();
            }
        };
    }
    
    // Créer des flocons régulièrement - CONTINU SANS ARRÊT
    snowInterval = setInterval(createSnowflake, 150); // Un peu plus rapide pour un effet plus dense
    
    // Ajuster dynamiquement le nombre de flocons basé sur la taille de l'écran
    function adjustSnowDensity() {
        // Pas besoin d'ajuster puisque ça continue indéfiniment
    }
    
    // Redémarrer la neige si le conteneur est supprimé par erreur
    function ensureSnowContainer() {
        if (!document.getElementById('snow-container')) {
            // Recréer le conteneur si il a été supprimé
            const newContainer = document.createElement('div');
            newContainer.id = 'snow-container';
            newContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9998;
                overflow: hidden;
            `;
            document.body.appendChild(newContainer);
            return newContainer;
        }
        return snowContainer;
    }
    
    // Vérifier périodiquement que le conteneur existe
    setInterval(ensureSnowContainer, 5000);
    
    // Stocker l'intervalle dans le conteneur pour y accéder plus tard
    snowContainer.snowInterval = snowInterval;
    
    return snowContainer;
}

// Démarrer l'effet de neige au chargement de la page
window.addEventListener('load', function() {
    // Attendre un peu après le loading screen
    setTimeout(() => {
        createSnowflakes();
    }, 1000);
});

// Fonction pour activer/désactiver manuellement les glaces
function toggleWinterEffect() {
    const existingSnow = document.getElementById('snow-container');
    if (existingSnow) {
        // Arrêter l'intervalle de création de flocons
        if (existingSnow.snowInterval) {
            clearInterval(existingSnow.snowInterval);
        }
        // Fade out progressif des flocons restants
        existingSnow.style.opacity = '0';
        setTimeout(() => {
            if (existingSnow.parentNode) {
                existingSnow.remove();
            }
        }, 1000);
        return false;
    } else {
        createSnowflakes();
        return true;
    }
}

// Ajouter un bouton de contrôle pour les glaces (optionnel)
function addWinterControl() {
    const winterBtn = document.createElement('button');
    winterBtn.id = 'winter-toggle';
    winterBtn.innerHTML = '❄';
    winterBtn.title = 'Activer/Désactiver l\'effet hiver';
    winterBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #87CEEB, #4682B4);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    winterBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    winterBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    winterBtn.addEventListener('click', function() {
        const isActive = toggleWinterEffect();
        this.style.background = isActive 
            ? 'linear-gradient(135deg, #87CEEB, #4682B4)'
            : 'linear-gradient(135deg, #d4af37, #b8952c)';
    });
    
    document.body.appendChild(winterBtn);
}

// Activer le contrôle des glaces (optionnel - décommentez si vous voulez le bouton)
// document.addEventListener('DOMContentLoaded', addWinterControl);

// Redémarrer la neige si la page change (pour les SPA)
window.addEventListener('beforeunload', function() {
    const existingSnow = document.getElementById('snow-container');
    if (existingSnow && existingSnow.snowInterval) {
        clearInterval(existingSnow.snowInterval);
    }
});