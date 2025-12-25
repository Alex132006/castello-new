// Loading screen with restaurant name - show only once
window.addEventListener("load", function () {
  if (!localStorage.getItem("hasSeenLoading")) {
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loading-screen";
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
      loadingScreen.style.opacity = "0";
      setTimeout(function () {
        loadingScreen.remove();
      }, 200);
    }, 900);

    // Mark as seen
    localStorage.setItem("hasSeenLoading", "true");
  }
});

// Effet de glaces d'hiver (neige) - version subtile
function createSnowflakes() {
  const snowContainer = document.createElement("div");
  snowContainer.id = "snow-container";
  snowContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
    `;
  document.body.appendChild(snowContainer);

  let snowInterval;

  function createSnowflake() {
    const snowflake = document.createElement("div");
    snowflake.innerHTML = "❄"; // Point plus subtil au lieu de ❄
    snowflake.style.cssText = `
            position: absolute;
            top: -10px;
            color: rgba(255, 255, 255, ${
              Math.random() * 0.3 + 0.1
            }); // Opacité très faible
            font-size: ${Math.random() * 6 + 4}px; // Taille plus petite
            user-select: none;
            pointer-events: none;
        `;

    snowContainer.appendChild(snowflake);

    const startPosition = Math.random() * window.innerWidth;
    const animationDuration = Math.random() * 8 + 10; // Plus lent: 10-18 secondes
    const swayAmplitude = (Math.random() - 0.5) * 30; // Mouvement latéral réduit

    snowflake.style.left = startPosition + "px";

    const fallAnimation = snowflake.animate(
      [
        {
          transform: `translateX(0px) translateY(0px)`,
          opacity: snowflake.style.opacity,
        },
        {
          transform: `translateX(${swayAmplitude}px) translateY(${
            window.innerHeight + 20
          }px)`,
          opacity: "0",
        },
      ],
      {
        duration: animationDuration * 1000,
        easing: "linear",
      }
    );

    fallAnimation.onfinish = () => {
      if (snowflake.parentNode) {
        snowflake.remove();
      }
    };
  }

  // Moins de flocons, créés moins fréquemment
  snowInterval = setInterval(createSnowflake, 900); // Un flocon toutes les 500ms

  function ensureSnowContainer() {
    if (!document.getElementById("snow-container")) {
      const newContainer = document.createElement("div");
      newContainer.id = "snow-container";
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

  setInterval(ensureSnowContainer, 10000);

  snowContainer.snowInterval = snowInterval;

  return snowContainer;
}

// Démarrer l'effet de neige subtile au chargement de la page
window.addEventListener("load", function () {
  setTimeout(() => {
    createSnowflakes();
  }, 1000);
});

// Fonction pour activer/désactiver manuellement les glaces
function toggleWinterEffect() {
  const existingSnow = document.getElementById("snow-container");
  if (existingSnow) {
    if (existingSnow.snowInterval) {
      clearInterval(existingSnow.snowInterval);
    }
    existingSnow.style.opacity = "❄";
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

// Ajouter un bouton de contrôle pour les glaces (optionnel et discret)
function addWinterControl() {
  const winterBtn = document.createElement("button");
  winterBtn.id = "winter-toggle";
  winterBtn.innerHTML = "•";
  winterBtn.title = "Activer/Désactiver l'effet hiver";
  winterBtn.style.cssText = `
        position: fixed;
        bottom: 15px;
        right: 15px;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: rgba(135, 206, 235, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        cursor: pointer;
        z-index: 10000;
        opacity: 0.5;
        transition: all 0.3s ease;
    `;

  winterBtn.addEventListener("mouseenter", function () {
    this.style.opacity = "1";
    this.style.transform = "scale(1.1)";
  });

  winterBtn.addEventListener("mouseleave", function () {
    this.style.opacity = "0.5";
    this.style.transform = "scale(1)";
  });

  winterBtn.addEventListener("click", function () {
    const isActive = toggleWinterEffect();
    this.style.background = isActive
      ? "rgba(135, 206, 235, 0.3)"
      : "rgba(212, 175, 55, 0.3)";
  });

  document.body.appendChild(winterBtn);
}

// Activer le contrôle des glaces (optionnel - décommentez si vous voulez le bouton)
// document.addEventListener('DOMContentLoaded', addWinterControl);

window.addEventListener("beforeunload", function () {
  const existingSnow = document.getElementById("snow-container");
  if (existingSnow && existingSnow.snowInterval) {
    clearInterval(existingSnow.snowInterval);
  }
});
