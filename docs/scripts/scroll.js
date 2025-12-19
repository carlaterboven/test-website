const container = document.getElementById("imageContainer");
const checkboxes = document.querySelectorAll("#filterBar input[type='checkbox']");

const imageList = manageImageList;
let images = [];
let currentIndex = 0;
let scrollPosition = 0;
let scalingValue = 1;
const maxScale = 0.02;
const maxScrollPosition = (maxScale + 1) * 1000;

// Funktion: kombiniere ausgewählte Kategorien
function updateImageList() {
    const selected = [...checkboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const combinedList = selected
      .flatMap(key => imageList[key] || [])
      .sort();

    // Container neu aufbauen
    container.innerHTML = "";
    combinedList.forEach(image => {
        const div = document.createElement("div");
        div.className = "image-container";
        const folder = image.split("/")[0];
        div.innerHTML = `<a href="projekte/${folder}.html"><img src="images/${image}" alt="${folder}"></a>`;
        container.appendChild(div);
    });

    // Nach DOM-Aktualisierung: neue NodeList referenzieren
    images = document.querySelectorAll('.image-container');

    // Wenn keine Bilder vorhanden, abbrechen
    if (images.length === 0) {
        console.warn("Keine Bilder gefunden – überprüfe manageImageList oder Filter.");
        return;
    }

    // Alle Klassen zurücksetzen
    images.forEach(img => img.className = "image-container");

    // Startzustand setzen
    currentIndex = 0;
    if (images[0]) images[0].classList.add('active');
    if (images[1]) images[1].classList.add('background');
}

// Event Listener für Änderungen
checkboxes.forEach(cb => cb.addEventListener("change", updateImageList));

// Initialer Aufruf
document.addEventListener("DOMContentLoaded", updateImageList);

window.addEventListener('wheel', (e) => {
    // Falls noch keine Bilder geladen: Abbruch
    if (!images || images.length === 0) return;

    const delta = e.deltaY;
    scrollPosition += delta;

    if (scrollPosition < 0) scrollPosition = 0;

    scalingValue = 1 - Math.abs(scrollPosition) / 1000;
    scalingValue = Math.max(scalingValue, maxScale);

    // Sicherheitsabfrage: existiert das aktuelle Bild wirklich?
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    currentImage.style.transform = `scale(${scalingValue})`;

    // --- Nach unten scrollen ---
    if (scalingValue <= maxScale && delta > 0) {
        const nextIndex = (currentIndex + 1) % images.length;
        const secondNextIndex = (currentIndex + 2) % images.length;

        currentImage.classList.replace('active', 'inactive');
        images[nextIndex].classList.replace('background', 'active');

        if (images[secondNextIndex]) {
            images[secondNextIndex].classList.remove('inactive');
            images[secondNextIndex].classList.add('background');
            images[secondNextIndex].style.transform = 'scale(1)';
        }

        currentIndex = nextIndex;
        scrollPosition = 0;
    }

    // --- Nach oben scrollen ---
    else if (scalingValue >= 1 && delta < 0) {
        const lastIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;

        if (images[lastIndex]) {
            images[lastIndex].classList.replace('background', 'inactive');
        }
        currentImage.classList.replace('active', 'background');
        images[prevIndex].classList.replace('inactive', 'active');
        images[prevIndex].style.transform = `scale(${maxScale})`;

        currentIndex = prevIndex;
        scrollPosition = maxScrollPosition;
    }
});
