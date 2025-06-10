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

function setBodyBackground(type) {
    document.body.style.backgroundImage = `url("assets/pokeball_icon.png"), radial-gradient(circle at 100vw 0vh, ${getTypeColor(type)} 0%, transparent 50vw)`;
    document.body.style.backgroundSize = '25%, cover';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat';
    document.body.style.backgroundPosition = '-180px -80px, right top';
    document.body.style.backgroundColor = '#f8f8f8';
}

const params = new URLSearchParams(window.location.search);
const typeId = params.get("type");

if (typeId) {
    fetch(`https://pokeapi.co/api/v2/type/${typeId}`)
        .then(response => {
            if (!response.ok) throw new Error("Tipo Pokémon non trovato");
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

function clearElementContent(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
}

function appendTypeElements(id, types) {
    const container = document.getElementById(id);
    if (!container) return;
    clearElementContent(id);

    types.forEach(t => {
        const el = document.createElement("p");
        el.innerText = capitalize(t.name);
        el.classList.add("damage-type")
        el.style.backgroundColor = getTypeColor(t.name);
        el.addEventListener("click", () => {
            const urlParts = t.url.split('/').filter(Boolean); // rimuove stringhe vuote
            const id = urlParts[urlParts.length - 1];
            window.location.href = `types_info.html?type=${id}`;
        });
        container.appendChild(el);
    });
}

function setAllInfo(type) {
    const nameEl = document.getElementById("name");
    if (nameEl) nameEl.innerHTML = capitalize(type.name);
    document.title = capitalize(type.name);

    const damageClassEl = document.getElementById("damage-class");
    if (damageClassEl) damageClassEl.innerHTML = capitalize(type.move_damage_class?.name || "-");

    document.getElementById("icon").src = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.name}.svg`;

    appendTypeElements("2-damage-to", type.damage_relations.double_damage_to);
    appendTypeElements("2-damage-from", type.damage_relations.double_damage_from);
    appendTypeElements("half-damage-to", type.damage_relations.half_damage_to);
    appendTypeElements("half-damage-from", type.damage_relations.half_damage_from);
    appendTypeElements("no-damage-to", type.damage_relations.no_damage_to);
    appendTypeElements("no-damage-from", type.damage_relations.no_damage_from);

    populatePokemonList(type.pokemon);
    populateMoveList(type.moves);
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

function populatePokemonList(pokemonArray) {
    const container = document.getElementById("pokemon-container");
    const dropDown = document.getElementById("left-p-text-pokemon");
    if (!container) return;
    container.innerHTML = "";

    dropDown.addEventListener("click", () => {
        container.classList.toggle("hide");
    });

    // Ordina alfabeticamente
    const sorted = pokemonArray.sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));

    sorted.forEach(entry => {
        const div = document.createElement("div");
        const name = formatPokemonName(entry.pokemon.name);
        const numberP = document.createElement("p")
        const nameP = document.createElement("p")
        const img = document.createElement("img")

        div.classList.add("pokemon-container");
        nameP.classList.add("name-pokemon");
        numberP.classList.add("number-pokemon");
        img.classList.add("img-pokemon");

        fetch(`https://pokeapi.co/api/v2/pokemon/${entry.pokemon.name}`)
            .then(response => {
                if (!response.ok) throw new Error("Pokémon non trovato");
                return response.json();
            })
            .then(data => {
                numberP.textContent = data.id;
                img.src = data.sprites.other['official-artwork'].front_default;
            })
            .catch(err => {
                console.error(err);
                showError("Errore nel recuperare i dati. Riprova più tardi.");
                setBodyBackground(); // colore di default
            });

        nameP.textContent = name;

        div.style.cursor = "pointer";

        div.addEventListener("click", () => {
            // reindirizza a una pagina personalizzata se la vuoi creare, es. `pokemon_info.html`
            window.location.href = `pokemon_info.html?pokemon=${entry.pokemon.name}`;
        });

        div.appendChild(numberP)
        div.appendChild(nameP)
        div.appendChild(img)

        container.appendChild(div);
    });
}

function populateMoveList(movesArray) {
    const container = document.getElementById("moves-container");
    const dropDown = document.getElementById("left-p-text-moves");
    if (!container) return;
    container.innerHTML = "";

    dropDown.addEventListener("click", () => {
        container.classList.toggle("hide");
    });

    // Ordina alfabeticamente
    const sorted = movesArray.sort((a, b) => a.name.localeCompare(b.name));
    let i = 0;

    sorted.forEach(move => {
        const div = document.createElement("div");
        const name = capitalize(move.name);
        const numberM = document.createElement("p")
        const nameM = document.createElement("p")
        const categ = document.createElement("div")

        div.classList.add("move-container");
        nameM.classList.add("name-move");
        numberM.classList.add("number-move");
        categ.classList.add("category-move");
        
        div.style.cursor = "pointer";
        numberM.textContent = i;
        nameM.textContent = name;

        fetch(`https://pokeapi.co/api/v2/move/${move.name}`)
            .then(response => {
                if (!response.ok) throw new Error("Mossa non trovata");
                return response.json();
            })
            .then(data => {
                //console.log(data);
                categ.textContent = data.damage_class.name;
            })
            .catch(err => {
                console.error(err);
                showError("Errore nel recuperare i dati. Riprova più tardi.");
                setBodyBackground(); // colore di default
            });

        div.addEventListener("click", () => {
            // reindirizza a una pagina personalizzata se la vuoi creare, es. `move_info.html`
            window.location.href = `move_info.html?name=${move.name}`;
        });


        div.appendChild(numberM)
        div.appendChild(nameM)
        div.appendChild(categ)

        container.appendChild(div);

        i++;
    });
}
