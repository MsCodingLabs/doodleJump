// Warten, bis die gesamte HTML-Seite geladen ist
document.addEventListener("DOMContentLoaded", () => {
  // Elemente aus dem HTML holen
  const grid = document.querySelector(".grid"); // Spielfeld
  const doodler = document.createElement("div"); // Spielfigur
  const startButton = document.getElementById("start-button"); // Startknopf
  const startScreen = document.querySelector(".start-screen"); // Startbildschirm

  // Größe von Spielfeld und Spielfigur
  const gridWidth = 400;
  const gridHeight = 600;
  const doodlerWidth = 60;
  const doodlerHeight = 85;

  // Spielzustände und Variablen
  let isGameOver = false; // Spiel vorbei?
  let speed = 3; // Bewegungsgeschwindigkeit der Plattformen
  let platformCount = 5; // Anzahl der Plattformen
  let platforms = []; // Liste mit allen Plattformen
  let score = 0; // Punktestand
  let doodlerLeftSpace = 50; // Position der Figur von links
  let startPoint = 150; // Startposition der Figur von unten
  let doodlerBottomSpace = startPoint; // Aktuelle Position von unten
  const gravity = 0.9; // "Schwerkraft"
  let upTimerId; // Timer fürs Springen
  let downTimerId; // Timer fürs Fallen
  let isJumping = false; // Springt die Figur gerade?
  let isGoingLeft = false;
  let isGoingRight = false;
  let leftTimerId;
  let rightTimerId;
  let platformTimerId;

  // Klasse für Plattformen
  class Platform {
    constructor(newPlatBottom) {
      this.left = Math.random() * (gridWidth - 85); // Zufällige Position von links
      this.bottom = newPlatBottom; // Position von unten
      this.visual = document.createElement("div"); // HTML-Element erstellen
      const visual = this.visual;
      visual.classList.add("platform"); // Klasse hinzufügen (für CSS)
      visual.style.left = this.left + "px";
      visual.style.bottom = this.bottom + "px";
      grid.appendChild(visual); // Plattform zum Spielfeld hinzufügen
    }
  }

  // Erstelle mehrere Plattformen im Spielfeld
  function createPlatforms() {
    platforms = [];
    for (let i = 0; i < platformCount; i++) {
      let platGap = gridHeight / platformCount; // Abstand zwischen Plattformen
      let newPlatBottom = i * platGap;
      let newPlatform = new Platform(newPlatBottom);
      platforms.push(newPlatform); // Zur Liste hinzufügen
    }
  }

  // Plattformen bewegen sich nach unten, wenn die Figur hoch genug ist
  function movePlatforms() {
    if (doodlerBottomSpace > 200) {
      platforms.forEach((platform) => {
        platform.bottom -= 4; // Nach unten bewegen
        let visual = platform.visual;
        visual.style.bottom = platform.bottom + "px";

        // Wenn Plattform unten aus dem Bild verschwindet, entfernen und neue erstellen
        if (platform.bottom < 10) {
          grid.removeChild(platform.visual);
          platforms.shift(); // Erste Plattform löschen
          score++; // Punktestand erhöhen
          let newPlatform = new Platform(gridHeight);
          platforms.push(newPlatform);
        }
      });
    }
  }

  // Spielfigur erstellen und platzieren
  function createDoodler() {
    grid.appendChild(doodler);
    doodler.classList.add("doodler");
    doodlerLeftSpace = platforms[0].left; // Auf der ersten Plattform starten
    doodler.style.left = doodlerLeftSpace + "px";
    doodler.style.bottom = doodlerBottomSpace + "px";
  }

  // Spielfigur fällt nach unten
  function fall() {
    clearInterval(upTimerId); // Springen stoppen
    isJumping = false;
    downTimerId = setInterval(function () {
      doodlerBottomSpace -= 5; // Position ändern
      doodler.style.bottom = doodlerBottomSpace + "px";

      // Wenn Figur ganz unten ist → Spiel vorbei
      if (doodlerBottomSpace <= 0) {
        gameOver();
      }

      // Prüfen, ob Figur auf einer Plattform landet
      platforms.forEach((platform) => {
        if (
          doodlerBottomSpace >= platform.bottom &&
          doodlerBottomSpace <= platform.bottom + 15 &&
          doodlerLeftSpace + doodlerWidth >= platform.left &&
          doodlerLeftSpace <= platform.left + 85 &&
          !isJumping
        ) {
          startPoint = doodlerBottomSpace; // Neue Startposition für Sprung
          isJumping = true;
          jump();
        }
      });
    }, 20); // alle 20 Millisekunden
  }

  let jumpHeight = 200; // Wie hoch springt die Figur?

  // Spielfigur springt nach oben
  function jump() {
    clearInterval(downTimerId); // Fallen stoppen
    isJumping = true;
    upTimerId = setInterval(function () {
      doodlerBottomSpace += 20;
      doodler.style.bottom = doodlerBottomSpace + "px";

      // Wenn Sprunghöhe erreicht → wieder fallen
      if (doodlerBottomSpace > startPoint + jumpHeight) {
        fall();
      }
    }, 30);
  }

  // Figur nach links bewegen
  function moveLeft() {
    if (isGoingRight) {
      clearInterval(rightTimerId);
      isGoingRight = false;
    }
    if (!isGoingLeft) {
      isGoingLeft = true;
      doodler.style.transform = "scaleX(-1)"; // Spiegeln nach links
      leftTimerId = setInterval(function () {
        if (doodlerLeftSpace >= 0) {
          doodlerLeftSpace -= 5;
          doodler.style.left = doodlerLeftSpace + "px";
        } else {
          clearInterval(leftTimerId);
          isGoingLeft = false;
        }
      }, 20);
    }
  }

  // Figur nach rechts bewegen
  function moveRight() {
    if (isGoingLeft) {
      clearInterval(leftTimerId);
      isGoingLeft = false;
    }
    if (!isGoingRight) {
      isGoingRight = true;
      doodler.style.transform = "scaleX(1)"; // Spiegeln nach rechts
      rightTimerId = setInterval(function () {
        if (doodlerLeftSpace <= gridWidth - doodlerWidth) {
          doodlerLeftSpace += 5;
          doodler.style.left = doodlerLeftSpace + "px";
        } else {
          clearInterval(rightTimerId);
          isGoingRight = false;
        }
      }, 20);
    }
  }

  // Tasteneingaben verarbeiten
  function control(e) {
    if (e.key === "ArrowLeft") {
      moveLeft();
    } else if (e.key === "ArrowRight") {
      moveRight();
    }
  }

  // Figur anhalten (nicht mehr nach links oder rechts)
  function moveStraight() {
    isGoingLeft = false;
    isGoingRight = false;
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
  }

  // Spiel beenden
  function gameOver() {
    isGameOver = true;
    clearInterval(upTimerId);
    clearInterval(downTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    clearInterval(platformTimerId);
    document.removeEventListener("keydown", control);

    // Spielfeld leeren
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    // "Game Over"-Text anzeigen
    const gameOverText = document.createElement("div");
    gameOverText.classList.add("game-over");
    gameOverText.textContent = "Game Over! Score: " + score;
    grid.appendChild(gameOverText);

    // Startknopf wieder aktivieren
    startButton.disabled = false;
  }

  // Spiel starten
  function start() {
    if (!isGameOver) {
      createPlatforms(); // Plattformen erzeugen
      createDoodler(); // Figur erstellen
      fall(); // Figur starten (sie fällt und springt)
      platformTimerId = setInterval(movePlatforms, 30); // Plattformen bewegen
      document.addEventListener("keydown", control); // Tastatursteuerung aktivieren
      startScreen.style.display = "none"; // Startbildschirm ausblenden
      grid.style.display = "block"; // Spielfeld anzeigen
      startButton.disabled = true; // Startknopf deaktivieren
    }
  }

  // Wenn Startknopf geklickt wird → Spiel starten
  startButton.addEventListener("click", start);
});
