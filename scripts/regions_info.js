function getRegionColor(region) {
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
    return colors[region] || "#AAA";
}

function setBodyBackground(region) {
    document.body.style.backgroundImage = `url("/assets/pokeball_icon.png"), radial-gradient(circle at 100vw 0vh, ${getRegionColor(region)} 0%, transparent 50vw)`;
    document.body.style.backgroundSize = '25%, cover';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
    document.body.style.backgroundPosition = '-180px -80px, right top';
    document.body.style.backgroundColor = '#f8f8f8';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    const container = document.getElementById("error-message");
    if (!container) {
        // se non esiste, crealo e appendilo nel body
        const errDiv = document.createElement("div");
        errDiv.id = "error-message";
        errDiv.style.color = "red";
        errDiv.style.fontWeight = "bold";
        errDiv.style.margin = "20px";
        errDiv.innerText = message;
        document.body.prepend(errDiv);
    } else {
        container.innerText = message;
    }
}

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

const params = new URLSearchParams(window.location.search);
const region = params.get("region");

if (region) {
    fetch(`https://pokeapi.co/api/v2/region/${region}`)
        .then(response => {
            if (!response.ok) throw new Error("Regione non trovata");
            return response.json();
        })
        .then(data => {
            setAllInfo(data);
            setBodyBackground(data.name);
        })
        .catch(err => {
            console.error(err);
            showError("Errore nel recuperare i dati. Riprova più tardi.");
            setBodyBackground(); // colore di default
        });
} else {
    console.error("Nessun ID specificato nell'URL.");
    showError("Nessun ID specificato nell'URL.");
    setBodyBackground(); // colore di default
}

function romanToDecimal(roman) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0, prev = 0;

    roman = roman.toUpperCase();

    for (let i = roman.length - 1; i >= 0; i--) {
        const curr = map[roman[i]];
        if (curr < prev) total -= curr;
        else total += curr;
        prev = curr;
    }

    return total;
}

function setAllInfo(region) {

    //console.log(region);

    const nameEl = document.getElementById("name");
    const genEl = document.getElementById("gen");
    const map = document.getElementById("map");


    if (nameEl) nameEl.innerHTML = capitalize(region.name);
    document.title = capitalize(region.name);

    genEl.innerHTML = capitalize(region.main_generation.name.split('-')[0] + ' ' + romanToDecimal(region.main_generation.name.split('-')[1]))

    map.src = "/assets/maps/" + region.name.toLowerCase() + ".png";
    map.addEventListener("click", () => {
        openModal(map.src);
    })

    populatePokemonList(region);
    populateGymLeadersList(region);
}

function populateGymLeadersList(region) {
    const dropDown = document.getElementById("gym-leaders-p");
    const container = document.getElementById("gym-leaders-container");
    dropDown.addEventListener("click", () => {
        container.classList.toggle("hide");
    });

    fetch(`/assets/json/gym_leaders.json`)
        .then(response => {
            if (!response.ok) throw new Error("Regione non trovata");
            return response.json();
        })
        .then(data => {
            console.log(data[region.name])
            createGymLeaders(data[region.name])
        })
        .catch(err => {
            console.error(err);
            showError("Errore nel recuperare i dati. Riprova più tardi.");
            setBodyBackground(); // colore di default
        });
}

function createGymLeaders(gymLeaders) {
    const main = document.getElementById("gym-leaders-container");
    gymLeaders.forEach(gymLeader => {
        const container = document.createElement("div");
        const name = document.createElement("p");
        const type = document.createElement("img");

        container.classList.add("gym-leader-container");
        name.classList.add("gym-leader-name");
        type.classList.add("gym-leader-type");

        container.style.background = `radial-gradient(circle at 100% 0%, ${getTypeColor(gymLeader.type)} 0%, transparent 50%)`;
        type.src = `/assets/types_icons/${gymLeader.type}_icon.png`;

        name.textContent = gymLeader.name
        type.textContent = gymLeader.type

        container.appendChild(name)
        container.appendChild(type)
        main.appendChild(container)
    });
}

function createPokemonCard(pokemon) {
    const container = document.createElement("div");
    container.className = "pokemon-container";
    container.addEventListener("click", () => {
        window.location.href = `pokemon_info.html?pokemon=${pokemon.id}`;
    });

    const number = document.createElement("span");
    number.className = "pokemon-number";
    number.textContent = `N° ${pokemon.id}`;

    const img = document.createElement("img");
    img.className = "pokemon-image";
    img.src = pokemon.sprites.front_default;

    const typeName = pokemon.types[0].type.name;
    img.style.backgroundImage = `url("assets/types_icons/${typeName}_icon.png")`;
    container.style.background = "radial-gradient(circle at 100% 0%, " + getTypeColor(typeName.toLowerCase()) + " 0%, transparent 40%),#f8f8f8"


    const name = document.createElement("p");
    name.className = "pokemon-name";
    name.textContent = formatPokemonName(pokemon.name);

    const typesContainer = document.createElement("div");
    typesContainer.className = "types-container";

    pokemon.types.forEach(typeInfo => {
        let type = typeInfo.type.name;
        type = type.charAt(0).toUpperCase() + type.slice(1);

        const typeDiv = document.createElement("p");
        typeDiv.className = "type-div";
        typeDiv.textContent = type;
        typeDiv.style.background = getTypeColor(type.toLowerCase());
        typesContainer.appendChild(typeDiv);
    });

    container.appendChild(number);
    container.appendChild(img);
    container.appendChild(name);
    container.appendChild(typesContainer);

    return container;
}

async function populatePokemonList(region) {
    const container = document.getElementById("pokedex-container");
    const dropDown = document.getElementById("pokedex-extandable");
    if (!container) return;

    container.innerHTML = "";

    dropDown.addEventListener("click", () => {
        container.classList.toggle("hide");
    });

    for (const pokedexRef of region.pokedexes) {
        try {
            const res = await fetch(pokedexRef.url);
            if (!res.ok) throw new Error(`Errore nel fetch del Pokédex: ${pokedexRef.name}`);
            const pokedexData = await res.json();

            const box = document.createElement("div");
            box.className = "pokedex-box";
            box.style.cursor = "pointer";

            const title = document.createElement("p");
            title.textContent = capitalize(pokedexData.name.replace('-', ' '));
            title.classList.add("pokedex-title");

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            // Imposto gli attributi width, height, viewBox e style
            svg.setAttribute("width", "23");
            svg.setAttribute("height", "23");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.style.verticalAlign = "middle";

            // Creo il path
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", "M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z");
            path.setAttribute("fill", "#0F0F0F");

            // Aggiungo il path all'SVG
            svg.appendChild(path);

            title.appendChild(svg)

            const pokemonList = document.createElement("div");
            pokemonList.classList.add("hide");
            pokemonList.classList.add("pokemon-list");

            box.addEventListener("click", () => {
                pokemonList.classList.toggle("hide");
            });

            const cards = [];

            for (const entry of pokedexData.pokemon_entries) {
                try {
                    const res = await fetch(entry.pokemon_species.url);
                    if (!res.ok) throw new Error(`Errore nel fetch della specie: ${entry.pokemon_species.name}`);
                    const speciesData = await res.json();

                    for (const variety of speciesData.varieties) {
                        try {
                            const varietyRes = await fetch(variety.pokemon.url);
                            if (!varietyRes.ok) throw new Error(`Errore nel fetch della varietà: ${variety.pokemon.name}`);
                            const varietyData = await varietyRes.json();

                            const card = createPokemonCard(varietyData);
                            cards.push({ id: varietyData.id, card }); // Salva ID per ordinamento

                        } catch (varErr) {
                            console.error("Errore caricando la varietà del Pokémon:", varErr);
                        }
                    }
                } catch (err) {
                    console.error("Errore caricando la specie del Pokémon:", err);
                }
            }

            // Dopo aver accumulato tutte le card, ordinale e appendile
            cards.sort((a, b) => a.id - b.id).forEach(({ card }) => {
                pokemonList.appendChild(card);
            });

            box.appendChild(title);
            box.appendChild(pokemonList);
            container.appendChild(box);

        } catch (err) {
            console.error("Errore caricamento Pokédex:", err);
        }
    }
}

function openModal(imageSrc) {
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-image");

    modalImg.src = imageSrc;
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target === this) {
        closeModal();
    }
});