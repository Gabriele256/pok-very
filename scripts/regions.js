function getregionColor(region) {
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

function romanToDecimal(roman) {
    const romanMap = {
        I: 1,
        V: 5,
        X: 10,
        L: 50,
        C: 100,
        D: 500,
        M: 1000
    };

    let total = 0;

    for (let i = 0; i < roman.length; i++) {
        const current = romanMap[roman[i]];
        const next = romanMap[roman[i + 1]];

        if (next && current < next) {
            total += next - current;
            i++; // salta il prossimo simbolo
        } else {
            total += current;
        }
    }

    return total;
}


async function loadPokemonregions() {
    const container = document.getElementById("regions-table");

    try {
        const response = await fetch("https://pokeapi.co/api/v2/region");
        const data = await response.json();

        // JSON locale con i nomi dei 3 starter per regione
        const startersData = await fetch('assets/json/starters.json').then(r => r.json());

        container.innerHTML = "";

        for (const region of data.results) {
            if (region.name === "hisui") continue;

            const urlParts = region.url.split('/').filter(Boolean);
            const id = urlParts[urlParts.length - 1];

            const main_div = document.createElement("div");
            const region_name = document.createElement("p");
            const starter_container = document.createElement("div");
            const starter_grass = document.createElement("img");
            const starter_fire = document.createElement("img");
            const starter_water = document.createElement("img");

            main_div.className = "region-container";
            region_name.className = "region-name";
            starter_container.className = "starters";
            starter_grass.className = "starter-grass";
            starter_fire.className = "starter-fire";
            starter_water.className = "starter-water";

            main_div.style.backgroundImage = `url(assets/regions/${region.name.toLowerCase()}.png)`;

            main_div.addEventListener("click", () => {
                window.location.href = `regions_info.html?region=${id}`;
            });

            region_name.textContent = region.name.toUpperCase();

            fetch(region.url)
                .then(res => res.json())
                .then(regionDetails => {
                    let generation = regionDetails.main_generation.name.replace("generation-", "GEN ").toUpperCase();
                    generation = generation.split(' ')[0] + ' ' +  romanToDecimal(generation.split(' ')[1])
                    region_name.innerHTML = `<span>${region.name.toUpperCase()}</span><span>${generation}</span>`;
                })
                .catch(err => {
                    console.warn("Errore nel recupero generazione:", err.message);
                    region_name.textContent = region.name.toUpperCase();
                });


            

            const starters = startersData[region.name.toLowerCase()];
            if (!starters || starters.length !== 3) {
                console.warn(`Starter non trovati per regione ${region.name}`);
                continue;
            }

            const [grassName, fireName, waterName] = starters;

            // Funzione helper per ottenere l'immagine
            async function getPokemonImg(name) {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
                if (!res.ok) throw new Error(`Errore caricamento ${name}`);
                const data = await res.json();
                return data.sprites.other["official-artwork"].front_default;
            }

            try {
                // carica tutte le immagini in parallelo
                const [grassUrl, fireUrl, waterUrl] = await Promise.all([
                    getPokemonImg(grassName),
                    getPokemonImg(fireName),
                    getPokemonImg(waterName)
                ]);

                starter_grass.src = grassUrl;
                starter_grass.alt = grassName;
                
                starter_fire.src = fireUrl;
                starter_fire.alt = fireName;

                starter_water.src = waterUrl;
                starter_water.alt = waterName;

                starter_container.appendChild(starter_grass);
                starter_container.appendChild(starter_fire);
                starter_container.appendChild(starter_water);

                main_div.appendChild(region_name);
                main_div.appendChild(starter_container);
                container.appendChild(main_div);

            } catch (err) {
                console.error("Errore nel caricamento immagini starter:", err.message);
            }
        }
    } catch (error) {
        container.innerHTML = `<div id="loader">Error loading regions</div>`;
        console.error(error);
    }
}

loadPokemonregions();