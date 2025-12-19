
const container = document.getElementById("imageContainer");
const checkboxes = document.querySelectorAll("#filterBar input[type='checkbox']");
const imageList = manageImageList;

let images = [];
let currentIndex = 0;
let scrollPosition = 0;

let scalingValue = 1; // Anfangsskalierung (Vollbild)
const maxScale = 0.02; // Minimale Größe des Bildes beim Verkleinern
const maxScrollPosition = (maxScale + 1) * 1000

// Funktion: kombiniere ausgewählte Kategorien
function updateImageList() {
    const selected = [...checkboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Alle ausgewählten Listen zusammenführen
    const combinedList = selected
      .flatMap(key => imageList[key] || [])
      .sort(); // alphabetische Sortierung um projekte zusammen anzuzeigen


    // Bilder zu image-container hinzufügen
    container.innerHTML = "";
    combinedList.forEach(image => {
        const div = document.createElement("div");
        div.className = "image-container";
        const folder = image.split("/")[0];
        div.innerHTML = `<a href="projekte/${folder}.html"><img src="images/${image}" alt="${folder}"></a>`;

        container.appendChild(div);
    });

    images = document.querySelectorAll('.image-container');

    // nicht alle Bilder sind von Anfang an im Hintergrund sichtbar
    images.forEach((image, index) => {
        if (index == currentIndex) {
            image.classList.add('active');
        } else if (index == currentIndex +1) {
            image.classList.add('background');
        } else {
            image.classList.add('inactive');
        }
    });
}

// Event Listener für Änderungen
checkboxes.forEach(cb => cb.addEventListener("change", updateImageList));

// Initialer Aufruf
updateImageList();


function handleScroll(delta) {
    scrollPosition += delta;  // delta>0: Scrollen nach unten, delta <0: Scrollen nach oben

    if (scrollPosition < 0) scrollPosition = 0;

    // Berechne den Skalierungswert basierend auf der Scrollposition
    scalingValue = 1 - Math.abs(scrollPosition) / 1000; // Die Skalierung kann von 1 bis maxScale (0.02) variieren
    scalingValue = Math.max(scalingValue, maxScale); // Skalierung niemals kleiner als maxScale (0.02)

    // Wende die Skalierung auf das aktive Bild an
    images[currentIndex].style.transform = `scale(${scalingValue})`;

    // Wechseln der Bilder, wenn genügend gescrollt wurde
    // Wenn nach unten gescrollt (delta>0), Bild wechseln nach unten
    if (scalingValue <= maxScale && delta > 0) {
        const nextIndex = (currentIndex + 1) % images.length;
        const secondNextIndex = (currentIndex + 2) % images.length;
        images[currentIndex].classList.add('inactive');
        images[currentIndex].classList.remove('active');
        images[nextIndex].classList.add('active');
        images[nextIndex].classList.remove('background');
        images[secondNextIndex].classList.add('background');
        images[secondNextIndex].style.transform = 'scale(1)';
        images[secondNextIndex].classList.remove('inactive');
        currentIndex = nextIndex;
        scrollPosition = 0;
    }
    else if (scalingValue >= 1 && delta < 0) {
        const lastIndex = (currentIndex + 1) % images.length;
        const nextIndex = (currentIndex - 1 + images.length) % images.length;
        images[currentIndex].classList.add('background');
        images[currentIndex].classList.remove('active');
        images[lastIndex].classList.add('inactive');
        images[lastIndex].classList.remove('background');
        images[nextIndex].classList.add('active');
        images[nextIndex].classList.remove('inactive');
        images[nextIndex].style.transform = `scale(${maxScale})`;
        currentIndex = nextIndex;
        scrollPosition = maxScrollPosition;
    }
}

let isPointerDown = false;
let lastY = 0;
let lastTime = 0;
let velocity = 0;
let momentumId = null;


window.addEventListener("wheel", (e) => {
    handleScroll(e.deltaY);
}, { passive: true });


function startMomentum() {
    isPointerDown = false;

    if (Math.abs(velocity) < 0.01) return;

    const friction = 0.95;   // 0.90 = kurz, 0.97 = sehr lang
    const multiplier = 16;  // höher = stärkerer Schwung

    function step() {
        velocity *= friction;
        handleScroll(velocity * multiplier);

        if (Math.abs(velocity) > 0.002) {
            momentumId = requestAnimationFrame(step);
        } else {
            velocity = 0;
            momentumId = null;
        }
    }

    step();
}


container.addEventListener("pointerdown", e => {
    isPointerDown = true;
    lastY = e.clientY;
    lastTime = performance.now();
    velocity = 0;

    if (momentumId) {
        cancelAnimationFrame(momentumId);
        momentumId = null;
    }

    container.setPointerCapture(e.pointerId);
});

container.addEventListener("pointermove", e => {
    if (!isPointerDown) return;
    if (e.pointerType === "mouse" && e.buttons !== 1) return;

    const now = performance.now();
    const dy = lastY - e.clientY;
    const dt = now - lastTime || 16;

    lastY = e.clientY;
    lastTime = now;

    const delta = Math.max(-60, Math.min(60, dy));

    handleScroll(delta);

    velocity = delta / dt;
});

container.addEventListener("pointerup", startMomentum);
container.addEventListener("pointercancel", startMomentum);
