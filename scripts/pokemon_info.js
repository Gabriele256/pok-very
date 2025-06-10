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
const pokemonIdentifier = params.get("pokemon");

if (pokemonIdentifier) {
    loadPokemon(pokemonIdentifier.toLowerCase()); // nome o ID
} else {
    console.error("Nessun Pokémon specificato nell'URL.");
}


function setBodyBackground(data) {
    const typeColor = getTypeColor(data.types[0].type.name.toLowerCase());

    document.body.style.backgroundImage = `url("assets/pokeball_icon.png"), radial-gradient(circle at 100vw 0%, ${typeColor} 0%, transparent 50vw)`;
    document.body.style.backgroundSize = '25%, cover';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
    document.body.style.backgroundPosition = '-180px -80px, right top';
    document.body.style.backgroundColor = '#f8f8f8';
}

async function loadPokemon(pokemonIdentifier) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonIdentifier}`);
        const data = await response.json();

        document.title = formatPokemonName(data.name);

        setBodyBackground(data);

        document.getElementById("name").textContent = formatPokemonName(data.name);
        document.getElementById("number").textContent = `N°${data.id}`;

        document.getElementById("pokemon-img").src = data.sprites.other['official-artwork'].front_default;
        document.getElementById("pokemon-img").style.backgroundImage = `url(https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${data.types[0].type.name.toLowerCase()}.svg)`;

        document.getElementById("height").textContent = `${data.height / 10}m`;
        document.getElementById("weight").textContent = `${data.weight / 10}kg`;

        const abilitiesContainer = document.getElementById("abilities-container");
        abilitiesContainer.innerHTML = '<p class="characteristics-title">Abilities</p>';
        data.abilities.forEach(a => {
            const p = document.createElement("p");
            p.textContent = capitalize(a.ability.name);
            abilitiesContainer.appendChild(p);
        });

        const typesContainer = document.getElementById("types-container");
        typesContainer.innerHTML = '';
        data.types.forEach(t => {
            const p = document.createElement("p");
            p.className = "type-container";
            p.textContent = capitalize(t.type.name);
            p.style.backgroundColor = getTypeColor(t.type.name.toLowerCase());
            p.addEventListener("click", () => {
                const urlParts = t.type.url.split('/').filter(Boolean);
                const id = urlParts[urlParts.length - 1];
                window.location.href = `types_info.html?type=${id}`;
            });
            typesContainer.appendChild(p);
        });

        const statsMap = {
            hp: "HP",
            attack: "ATK",
            defense: "DEF",
            "special-attack": "SpA",
            "special-defense": "SpD",
            speed: "SPD"
        };
        let total = 0;
        data.stats.forEach(stat => {
            const key = stat.stat.name;
            const value = stat.base_stat;
            total += value;

            const containerId = statsMap[key] ? `${statsMap[key]}-container` : null;
            if (containerId) {
                const container = document.getElementById(containerId);
                container.querySelector(".stat").textContent = value;
            }
        });

        document.getElementById("TOT-container").querySelector(".stat").textContent = total;

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const flavor = speciesData.flavor_text_entries.find(
            entry => entry.language.name === "en"
        );
        document.getElementById("description").innerHTML = flavor.flavor_text.replace(/\f/g, ' ');

        // --- Inizio Aggiunta per il Sesso del Pokémon ---
        const genderRate = speciesData.gender_rate; // 0-8 (8 = 100% femmina, -1 = sconosciuto/agender)
        const genderDisplayElement = document.getElementById("pokemon-gender-display"); // Assumendo un elemento HTML per mostrarlo

        if (genderDisplayElement) {
            if (genderRate === -1) {
                genderDisplayElement.innerHTML = `<span>Genderless</span>`;
            } else if (genderRate === 8) {
                genderDisplayElement.innerHTML = `<span>♀</span>`; // Solo femmina
                genderDisplayElement.style.color = "#FF69B4"; // Rosa
            } else if (genderRate === 0) {
                genderDisplayElement.innerHTML = `<span>♂</span>`; // Solo maschio
                genderDisplayElement.style.color = "#00BFFF"; // Azzurro
            } else {
                // Percentuali di maschio/femmina
                const femalePercentage = (genderRate / 8) * 100;
                const malePercentage = 100 - femalePercentage;
                genderDisplayElement.innerHTML = `<span style="color:#00BFFF;">${malePercentage}%♂</span> / <span style="color:#FF69B4;">${femalePercentage}%♀</span>`;
            }
        }
        // --- Fine Aggiunta per il Sesso del Pokémon ---


        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        loadEvolutionSprites(evolutionData);
    } catch (error) {
        console.error("Errore nel caricamento del Pokémon:", error);
    }
}

async function loadEvolutionSprites(evolutionData) {
    const container = document.getElementById("evolutions-container");
    container.innerHTML = "";

    async function renderNode(node) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("evolution-branch");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.margin = "1%";
        wrapper.style.width = "100%";

        // Fetch sprite e dati del Pokémon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${node.species.name}`);
        const pokeData = await res.json();

        // Recupera i dati della specie
        const speciesRes = await fetch(node.species.url);
        const speciesData = await speciesRes.json();

        // Crea un contenitore per la forma base + forme regionali affiancate
        const mainFormsContainer = document.createElement("div");
        mainFormsContainer.style.display = "flex";
        mainFormsContainer.style.flexDirection = "row";
        mainFormsContainer.style.alignItems = "center";
        mainFormsContainer.style.gap = "20px";
        mainFormsContainer.style.marginBottom = "10px";

        // Immagine base evoluzione
        const baseForm = document.createElement("div");
        baseForm.style.display = "flex";
        baseForm.style.flexDirection = "column";
        baseForm.style.alignItems = "center";

        const img = document.createElement("img");
        img.src = pokeData.sprites.front_default;
        img.alt = "";
        img.title = formatPokemonName(node.species.name);
        img.classList.add("evolution-img");
        img.addEventListener("click", () => {
            window.location.href = `pokemon_info.html?pokemon=${pokeData.id}`;
        });
        baseForm.appendChild(img);
        mainFormsContainer.appendChild(baseForm);

        // Filtra solo le forme regionali (Alola, Galar, Hisui, Paldea)
        const regionalForms = speciesData.varieties.filter(variety => {
            if (variety.pokemon.name === node.species.name) return false;
            return variety.pokemon.name.includes("-alola") ||
                variety.pokemon.name.includes("-galar") ||
                variety.pokemon.name.includes("-hisui") ||
                variety.pokemon.name.includes("-paldea");
        });

        // Aggiungi le forme regionali affiancate
        for (const regionalForm of regionalForms) {
            const regionalPokeRes = await fetch(regionalForm.pokemon.url);
            const regionalPokeData = await regionalPokeRes.json();

            const regionalDiv = document.createElement("div");
            regionalDiv.style.display = "flex";
            regionalDiv.style.flexDirection = "column";
            regionalDiv.style.alignItems = "center";

            const regionalImg = document.createElement("img");
            regionalImg.src = regionalPokeData.sprites.front_default;
            regionalImg.alt = "";
            regionalImg.title = formatPokemonName(regionalForm.pokemon.name);
            regionalImg.classList.add("evolution-img");
            regionalImg.addEventListener("click", () => {
                window.location.href = `pokemon_info.html?pokemon=${regionalPokeData.id}`;
            });

            const formText = document.createElement("p");
            formText.classList.add("levels")
            formText.style.marginTop = "4px";
            formText.style.fontSize = "0.8em";
            formText.style.fontWeight = "bold";

            const typeInfo = getFormTypeInfo(regionalForm.pokemon.name);
            formText.style.color = typeInfo.color;
            formText.textContent = typeInfo.text;

            regionalDiv.appendChild(regionalImg);
            regionalDiv.appendChild(formText);
            mainFormsContainer.appendChild(regionalDiv);
        }

        wrapper.appendChild(mainFormsContainer);

        // Filtra le altre forme speciali (mega, gmax) per metterle sotto
        const otherSpecialForms = speciesData.varieties.filter(variety => {
            if (variety.pokemon.name === node.species.name) return false;
            return variety.pokemon.name.includes("-mega") ||
                variety.pokemon.name.includes("-gmax");
        });

        if (otherSpecialForms.length > 0) {
            const specialFormsWrapper = document.createElement("div");
            specialFormsWrapper.style.display = "flex";
            specialFormsWrapper.style.flexDirection = "row";
            specialFormsWrapper.style.justifyContent = "center";
            specialFormsWrapper.style.marginTop = "10px";
            specialFormsWrapper.style.gap = "10px";

            for (const specialForm of otherSpecialForms) {
                const specialPokeRes = await fetch(specialForm.pokemon.url);
                const specialPokeData = await specialPokeRes.json();

                const specialDiv = document.createElement("div");
                specialDiv.style.display = "flex";
                specialDiv.style.flexDirection = "column";
                specialDiv.style.alignItems = "center";

                const specialImg = document.createElement("img");
                specialImg.src = specialPokeData.sprites.front_default;
                specialImg.alt = "";
                specialImg.title = formatPokemonName(specialForm.pokemon.name);
                specialImg.classList.add("evolution-img");
                specialImg.addEventListener("click", () => {
                    window.location.href = `pokemon_info.html?pokemon=${specialPokeData.id}`;
                });

                const formText = document.createElement("p");
                formText.classList.add("levels")
                formText.style.marginTop = "4px";
                formText.style.fontSize = "0.8em";
                formText.style.fontWeight = "bold";

                const typeInfo = getFormTypeInfo(specialForm.pokemon.name);
                formText.style.color = typeInfo.color;
                formText.textContent = typeInfo.text;

                specialDiv.appendChild(formText);
                specialDiv.appendChild(specialImg);
                specialFormsWrapper.appendChild(specialDiv);
            }
            wrapper.appendChild(specialFormsWrapper);
        }

        // Gestione delle evoluzioni successive
        if (node.evolves_to && node.evolves_to.length > 0) {
            const branches = document.createElement("div");
            branches.style.display = "flex";
            branches.style.gap = "2%";
            branches.style.justifyContent = "center";
            branches.style.marginTop = "1%";

            for (const evo of node.evolves_to) {
                const evoDetail = evo.evolution_details[0];
                const methodText = getEvolutionMethodText(evoDetail);

                const method = document.createElement("p");
                method.classList.add("levels");
                method.textContent = methodText;

                const evoBranch = await renderNode(evo);

                const singleBranch = document.createElement("div");
                singleBranch.style.display = "flex";
                singleBranch.style.flexDirection = "column";
                singleBranch.style.alignItems = "center";
                singleBranch.style.justifyContent = "space-between";

                singleBranch.appendChild(method);
                singleBranch.appendChild(evoBranch);
                branches.appendChild(singleBranch);
            }

            wrapper.appendChild(branches);
        }

        return wrapper;
    }

    function getEvolutionMethodText(detail) {
        if (!detail) return "?";

        const parts = [];

        if (detail.min_level !== null) parts.push(`Lv. ${detail.min_level}`);
        if (detail.gender !== null) parts.push(detail.gender === 1 ? "Female" : "Male");
        if (detail.item) parts.push(`${capitalize(detail.item.name.replace(/-/g, " "))}`);
        if (detail.trigger.name === "trade") parts.push("Trade");
        if (detail.known_move) parts.push(`Move: ${capitalize(detail.known_move.name)}`);
        if (detail.min_happiness !== null) parts.push("High Friendship");
        if (detail.min_beauty !== null) parts.push("High Beauty");
        if (detail.location) {
            const loc = detail.location.name;
            const cleanLoc = loc
                .replace(/-/g, " ")
                .replace(/\b(route|area|zone|cave|mount|mt|forest|city|town|island)\b/gi, match => capitalize(match));
            parts.push(`Location: ${capitalize(cleanLoc)}`);
        }

        if (detail.trigger.name === "level-up" && detail.held_item && detail.held_item.name.includes("mega-stone")) {
            parts.push("Mega Stone");
        }


        return parts.length > 0 ? parts.join(" + ") : "?";
    }

    const tree = await renderNode(evolutionData.chain);
    container.appendChild(tree);
}