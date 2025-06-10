function getTypeColor(type) {
    const colors = {
        water: "#5090D6",
        fire: "#FF9D55",
        grass: "#63BC5A",
        poison: "#B567CE",
        bug: "#91C12F",
        normal: "#919AA2",
        flying: "#89AAE3",
        electric: "#F4D23C",
        ground: "#D97845",
        fairy: "#EC8FE6",
        fighting: "#CE416B",
        psychic: "#FA7179",
        rock: "#C5B78C",
        ghost: "#5269AD",
        ice: "#73CEC0",
        dragon: "#0B6DC3",
        dark: "#5A5465",
        steel: "#5A8EA2"
    };
    return colors[type] || "#AAA";
}


async function loadPokemonTypes() {
    const container = document.getElementById("types-table");
    container.innerHTML = '<div id="loader">Loading types...</div>';

    try {
        const response = await fetch("https://pokeapi.co/api/v2/type");
        const data = await response.json();

        container.innerHTML = "";

        data.results.forEach(type => {
            if (!(type.name === "stellar" || type.name === "unknown")) {
                // Estrai id dall'URL
                const urlParts = type.url.split('/').filter(Boolean); // rimuove stringhe vuote
                const id = urlParts[urlParts.length - 1];

                const typeDiv = document.createElement("div");
                typeDiv.className = "type-container";
                typeDiv.style.background = `radial-gradient(circle at 100% 0%, ${getTypeColor(type.name.toLowerCase())} 0%, transparent 80%), #f8f8f8`;

                typeDiv.addEventListener("click", () => {
                    window.location.href = `types_info.html?type=${id}`;
                });

                // Nome tipo
                const nameElem = document.createElement("div");
                nameElem.textContent = type.name.toUpperCase();
                nameElem.className = "type-name";

                // Icona tipo
                const imgElem = document.createElement("img");
                imgElem.src = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.name}.svg`;
                imgElem.alt = `${type.name} icon`;
                imgElem.className = "type-icon";

                typeDiv.appendChild(imgElem);
                typeDiv.appendChild(nameElem);
                container.appendChild(typeDiv);
            }
        });

    } catch (error) {
        container.innerHTML = `<div id="loader">Error loading types</div>`;
        console.error(error);
    }
}

loadPokemonTypes();
