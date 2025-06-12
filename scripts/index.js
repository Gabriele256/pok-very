document.addEventListener("DOMContentLoaded", () => {
    const pokedexTable = document.getElementById("pokedex-table");
    const loader = document.getElementById("loader");
    const searchBar = document.getElementById("search-bar");
    const searchButton = document.getElementById("search");

    let offset = 0;
    const limit = 20;
    let isLoading = false;
    let allPokemonCache = []; // Cache per i risultati di ricerca

    // Funzione principale per caricare i Pokémon
    async function fetchPokemonBatch(offset, limit) {
        const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            const detailedPokemon = await Promise.all(
                data.results.map(p => fetch(p.url).then(res => res.json())
            ));
            return detailedPokemon;
        } catch (err) {
            console.error("Errore nel caricamento dei Pokémon:", err);
            return [];
        }
    }

    // Funzione per cercare Pokémon
    async function searchPokemon() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // Se la ricerca è vuota, ricarica la lista normale
            offset = 0;
            pokedexTable.innerHTML = '';
            loadMorePokemon();
            return;
        }

        isLoading = true;
        loader.textContent = "Searching...";
        pokedexTable.innerHTML = '';

        try {
            // Se non abbiamo già tutti i Pokémon in cache, li carichiamo
            if (allPokemonCache.length === 0) {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=11000`);
                const data = await response.json();
                allPokemonCache = await Promise.all(
                    data.results.map(p => fetch(p.url).then(res => res.json()))
                );
            }

            // Filtra i Pokémon in base al termine di ricerca
            const results = allPokemonCache.filter(pokemon => 
                pokemon.name.includes(searchTerm) || 
                pokemon.id.toString() === searchTerm
            );

            if (results.length === 0) {
                pokedexTable.innerHTML = `<div class="no-results" style="color:red;">No Pokémon found</div>`;
            } else {
                results.forEach(pokemon => {
                    const card = createPokemonCard(pokemon);
                    pokedexTable.appendChild(card);
                });
            }
        } catch (error) {
            console.error("Errore nella ricerca:", error);
            pokedexTable.innerHTML = `<div class="no-results" style="color=red">Error</div>`;
        } finally {
            isLoading = false;
            loader.textContent = "You've reached the bottom";
        }
    }

    // Funzione per creare la card del Pokémon (mantenuta uguale alla tua)
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

        if (pokemon.sprites.front_default != null){
            img.src = pokemon.sprites.front_default; 
        }else{
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`; 
        }

        console.log(img.src0)
        
        const typeName = pokemon.types[0].type.name;
        img.style.backgroundImage = `url("./assets/types_icons/${typeName}_icon.png")`;
        container.style.background = "radial-gradient(circle at 100% 0%, " + getTypeColor(typeName.toLowerCase()) + " 0%, transparent 40%),#f8f8f8"

        const name = document.createElement("h3");
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

    // Funzione per il caricamento infinito (mantenuta uguale alla tua)
    async function loadMorePokemon() {
        if (isLoading) return;
        isLoading = true;
        loader.textContent = "Caricamento...";

        const pokemonList = await fetchPokemonBatch(offset, limit);
        pokemonList.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokedexTable.appendChild(card);
        });

        offset += limit;
        isLoading = false;
        loader.textContent = "Hai raggiunto la fine";
    }

    // Observer per lo scroll infinito (mantenuto uguale al tuo)
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && searchBar.value === '') {
            loadMorePokemon();
        }
    }, {
        rootMargin: "100px"
    });

    observer.observe(loader);

    // Event listeners per la ricerca
    searchButton.addEventListener('click', searchPokemon);
    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });

    // Primo caricamento
    loadMorePokemon();
});

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