const navigationMap = {
    "header-logo": "index.html",
    "header-pokedex": "index.html",
    "header-regions": "regions.html",
    "header-types": "types.html",
    "header-abilities": "abilities.html",
    "header-items": "items.html",
    "header-berries": "berries.html",
    "header-moves": "moves.html"
};

for (const [id, path] of Object.entries(navigationMap)) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener("click", () => {
            window.location.href = `index.html`;
        });
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPokemonName(name) {

    // Lista di suffissi che indicano forme (non parte del nome base)
    const formSuffixes = [
        'mega', 'mega-x', 'mega-y', 'gmax', 'alola', 'galar', 
        'hisui', 'paldea', 'f', 'm', 'fan', 'heat', 'wash', 
        'frost', 'mow', 'original', 'attack', 'defense', 'speed',
        'overcast', 'sky', 'land', 'water', 'fire', 'ice', 'grass',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy'
    ];

    // Separa il nome in parti
    const parts = name.split('-');
    const basePart = parts[0];
    const suffix = parts.slice(1).join('-');

    // Controlla se il suffisso è un indicatore di forma
    const isForm = formSuffixes.includes(suffix) || 
                  formSuffixes.some(form => suffix.startsWith(form + '-'));

    if (isForm) {
        // Gestione delle forme speciali
        const formPatterns = {
            'mega-x': (n) => `Mega ${capitalize(n)} X`,
            'mega-y': (n) => `Mega ${capitalize(n)} Y`,
            'mega': (n) => `Mega ${capitalize(n)}`,
            'gmax': (n) => `${capitalize(n)} Gmax`,
            'alola': (n) => `Alolan ${capitalize(n)}`,
            'galar': (n) => `Galarian ${capitalize(n)}`,
            'hisui': (n) => `Hisuian ${capitalize(n)}`,
            'paldea': (n) => `Paldean ${capitalize(n)}`,
            'f': (n) => `${capitalize(n)} ♀`,
            'm': (n) => `${capitalize(n)} ♂`,
            'default': (n, s) => `${capitalize(n)} (${capitalize(s)} Form)`
        };

        for (const [form, formatter] of Object.entries(formPatterns)) {
            if (suffix === form) {
                return formatter(basePart);
            }
        }

        // Se non è una delle forme speciali, usa il formatter di default
        return formPatterns.default(basePart, suffix);
    }

    // Se non è una forma, capitalizza tutte le parti
    return parts.map(part => capitalize(part)).join(' ');
}

// Nuova funzione per determinare il testo e il colore della forma speciale
function getFormTypeInfo(pokemonName) {
    if (pokemonName.includes("-mega")) {
        return { text: "Megaevolution", color: "#D44141" }; // Rosso per Mega
    } else if (pokemonName.includes("-gmax")) {
        return { text: "Gigantamax", color: "#8A2BE2" }; // Blu per Gmax
    } else if (pokemonName.includes("-totem")) {
        return { text: "Alola Totem", color: "#228B22" }; // Blu per Totem
    } else if (pokemonName.includes("-alola") || pokemonName.includes("-galar") || 
               pokemonName.includes("-hisui") || pokemonName.includes("-paldea")) {
        const regionName = pokemonName.split('-').pop(); 
        return { text: `${capitalize(regionName)} Form`, color: "#4682B4" }; // Viola per le forme regionali
    }
    return { text: "Special Form", color: "#696969" }; // Colore di default
}