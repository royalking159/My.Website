// Toggle sidebar and persist in local storage
function toggleSidebar() {
    const sidebar = document.getElementById("mainSidebar");
    sidebar.classList.toggle("expanded");
    localStorage.setItem("sidebarExpanded", sidebar.classList.contains("expanded"));
}

document.addEventListener("DOMContentLoaded", () => {
    // Sync sidebar state
    const sidebar = document.getElementById("mainSidebar");
    if (sidebar && localStorage.getItem("sidebarExpanded") === "true") {
        sidebar.classList.add("expanded");
    }

    // Capture route targets
    const isLibrary = document.getElementById("full-library-grid");
    const isDetails = document.getElementById("details-view-container");

    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            if (isLibrary) renderGrid(data.catalog, "full-library-grid");
            if (isDetails) renderDetails(data.catalog);
        })
        .catch(err => console.error("Database initialization fault:", err));
});

// Render dynamic streaming posters across main grids
function renderGrid(catalog, targetId) {
    const grid = document.getElementById(targetId);
    if (!grid) return;
    grid.innerHTML = "";

    catalog.forEach(item => {
        const cardHtml = `
            <a href="movie-details.html?id=${item.id}" class="stremio-card" data-name="${item.name.toLowerCase()}">
                <div class="poster-wrapper">
                    <img src="${item.poster}" class="stremio-poster" alt="${item.name}">
                    <div class="card-play-btn">▶</div>
                </div>
                <div class="card-title">${item.name}</div>
            </a>
        `;
        grid.insertAdjacentHTML("beforeend", cardHtml);
    });
}

function filterLibrary() {
    const query = document.getElementById("catalogSearch").value.toLowerCase();
    const cards = document.querySelectorAll("#full-library-grid .stremio-card");
    cards.forEach(card => {
        const name = card.getAttribute("data-name");
        card.style.display = name.includes(query) ? "flex" : "none";
    });
}

// Map split workspace modules cleanly out of data.json profile mapping
function renderDetails(catalog) {
    const container = document.getElementById("details-view-container");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const item = catalog.find(x => x.id === id);

    if (!item) {
        container.innerHTML = "<h2>Target stream path profile absent from index.</h2>";
        return;
    }

    // Inject blurred wallpaper layout canvas background
    document.getElementById("backdropBg").style.backgroundImage = `url('${item.backdrop || item.poster}')`;

    const genrePills = item.genres.map(g => `<span class="pill">${g}</span>`).join("");
    const castPills = item.cast.map(c => `<span class="pill">${c}</span>`).join("");

    let episodesPanelHTML = "";
    if (item.seasons && item.seasons.length > 0) {
        const optionsHTML = item.seasons.map((s, idx) => 
            `<option value="${s.seasonNumber}" ${idx === 0 ? 'selected' : ''}>${s.seasonName}</option>`
        ).join("");

        episodesPanelHTML = `
            <div class="episode-panel">
                <div class="season-selector-wrapper">
                    <select class="season-select" id="seasonPicker" onchange="updateEpisodeList(this.value, '${item.id}')">
                        ${optionsHTML}
                    </select>
                </div>
                <div class="episode-scroll-area" id="episodeScrollBox"></div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="details-wrapper">
            <!-- Left Side Details Grid -->
            <div class="meta-panel">
                <h1 class="show-logo-title">${item.name}</h1>
                <div class="stats-line">
                    <span>${item.runtime || ''}</span>
                    <span>${item.releaseDate}–${item.endDate || ''}</span>
                    <span class="imdb-badge">${item.rating || '0.0'} IMDb</span>
                </div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Genres</div>
                <div class="pill-container">${genrePills}</div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Cast</div>
                <div class="pill-container">${castPills}</div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Summary</div>
                <p class="summary-text">${item.description}</p>
            </div>

            <!-- Right Side Interactive Panel Module -->
            ${episodesPanelHTML}
        </div>
    `;

    if (item.seasons && item.seasons.length > 0) {
        updateEpisodeList(item.seasons[0].seasonNumber, item.id);
    }
}

// Generate real time sub-ep listings straight out of nested JSON objects
function updateEpisodeList(seasonNum, itemId) {
    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            const item = data.catalog.find(x => x.id === itemId);
            const season = item.seasons.find(s => s.seasonNumber == seasonNum);
            const scrollBox = document.getElementById("episodeScrollBox");
            if (!scrollBox || !season) return;

            scrollBox.innerHTML = "";
            season.episodes.forEach(ep => {
                const epHtml = `
                    <a href="${ep.playLink}" target="_blank" class="stremio-ep-item">
                        <div class="ep-thumb-box">
                            <img src="${ep.thumbnail}" alt="${ep.title}">
                        </div>
                        <div class="ep-info-box">
                            <div class="ep-title-text">${ep.ep}. ${ep.title}</div>
                            <div class="ep-desc-text">${ep.description}</div>
                        </div>
                    </a>
                `;
                scrollBox.insertAdjacentHTML("beforeend", epHtml);
            });
        });
}