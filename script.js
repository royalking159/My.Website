// Manage Sidebar expansion state
function toggleSidebar() {
    const sidebar = document.getElementById("mainSidebar");
    sidebar.classList.toggle("expanded");
    
    // Track setup in localStorage so it persists across local navigation pages
    localStorage.setItem("sidebarExpanded", sidebar.classList.contains("expanded"));
}

// Restore sidebar layout setting dynamically on launch
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("mainSidebar");
    if (sidebar && localStorage.getItem("sidebarExpanded") === "true") {
        sidebar.classList.add("expanded");
    }

    // Identify View Layout Nodes
    const isHome = document.getElementById("continue-watching-grid");
    const isLibrary = document.getElementById("full-library-grid");
    const isDetails = document.getElementById("details-view-container");

    fetch("data.json")
        .then(res => res.json())
        .then(data => {
            if (isHome) renderHome(data.catalog);
            if (isLibrary) renderLibrary(data.catalog);
            if (isDetails) renderDetails(data.catalog);
        })
        .catch(err => console.error("Database connection failure:", err));
});

function renderHome(catalog) {
    const continueGrid = document.getElementById("continue-watching-grid");
    const popularGrid = document.getElementById("popular-catalog-grid");

    catalog.forEach(item => {
        const cardHtml = `
            <a href="movie-details.html?id=${item.id}" class="stremio-card">
                <div class="poster-wrapper">
                    <img src="${item.poster}" class="stremio-poster" alt="${item.name}">
                    <div class="card-play-btn">▶</div>
                    ${item.continueWatching ? `
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${item.progress}%"></div>
                        </div>
                    ` : ''}
                </div>
                <div class="card-title">${item.name}</div>
            </a>
        `;

        if (item.continueWatching && continueGrid) {
            continueGrid.insertAdjacentHTML("beforeend", cardHtml);
        } else if (popularGrid) {
            popularGrid.insertAdjacentHTML("beforeend", cardHtml);
        }
    });
}

function renderLibrary(catalog) {
    const grid = document.getElementById("full-library-grid");
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

function renderDetails(catalog) {
    const container = document.getElementById("details-view-container");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const item = catalog.find(x => x.id === id);

    if (!item) {
        container.innerHTML = "<h2>Target catalog profile not located.</h2>";
        return;
    }

    // Establish blurry cinematic background layout wall
    document.getElementById("backdropBg").style.backgroundImage = `url('${item.backdrop || item.poster}')`;

    // Process options arrays
    const genrePills = item.genres.map(g => `<span class="pill">${g}</span>`).join("");
    const castPills = item.cast.map(c => `<span class="pill">${c}</span>`).join("");

    // Setup Split Interface Modules matching structural elements in Photo 2
    let rightPanelHTML = "";
    if (item.seasons && item.seasons.length > 0) {
        let optionsHTML = item.seasons.map((s, idx) => 
            `<option value="${s.seasonNumber}" ${idx === 0 ? 'selected' : ''}>${s.seasonName}</option>`
        ).join("");

        rightPanelHTML = `
            <div class="episode-panel">
                <div class="panel-header-actions">
                    <div class="toggle-container">
                        <label style="position:relative; display:inline-block; width:34px; height:20px;">
                            <input type="checkbox" checked style="opacity:0; width:0; height:0;">
                            <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#7047eb; transition:.4s; border-radius:34px;"></span>
                        </label>
                        <span>Receive notifications for new episodes</span>
                    </div>
                </div>
                
                <div class="season-selector-wrapper">
                    <select class="season-select" id="seasonPicker" onchange="updateEpisodeList(this.value, '${item.id}')">
                        ${optionsHTML}
                    </select>
                </div>

                <div class="episode-scroll-area" id="episodeScrollBox">
                    <!-- Loaded dynamically via subrouter -->
                </div>
            </div>
        `;
    } else {
        rightPanelHTML = `
            <div class="episode-panel" style="text-align:center; padding: 40px 20px;">
                <h3 style="margin-top:0;">Standalone Feature Content</h3>
                <a href="#" class="pill" style="background:var(--accent-purple); display:inline-block; margin-top:15px; text-decoration:none;">▶ Play Movie Asset</a>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="details-wrapper">
            <!-- Left Metadata Module -->
            <div class="meta-panel">
                <h1 class="show-logo-title">${item.name}</h1>
                <div class="stats-line">
                    <span>${item.runtime || 'N/A'}</span>
                    <span>${item.releaseDate}–${item.endDate || ''}</span>
                    <span class="imdb-badge">${item.rating || '0.0'} IMDb</span>
                </div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Genres</div>
                <div class="pill-container">${genrePills}</div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Cast</div>
                <div class="pill-container">${castPills}</div>
                
                <div style="color:var(--text-secondary); margin-bottom:10px; font-size:13px; font-weight:bold; text-transform:uppercase;">Summary</div>
                <p class="summary-text">${item.description}</p>
                
                <button class="pill" style="background: rgba(255,255,255,0.15); font-weight:bold; cursor:pointer;">🎬 Watch Trailer</button>
            </div>

            <!-- Right Scrollable Interactive List Module -->
            ${rightPanelHTML}
        </div>
    `;

    // Fire default list generator engine instance for first index
    if (item.seasons && item.seasons.length > 0) {
        updateEpisodeList(item.seasons[0].seasonNumber, item.id);
    }
}

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
                const itemHtml = `
                    <a href="${ep.playLink}" target="_blank" class="stremio-ep-item">
                        <div class="ep-thumb-box">
                            <img src="${ep.thumbnail}" alt="${ep.title}">
                        </div>
                        <div class="ep-info-box">
                            <div class="ep-title-text">${ep.ep}. ${ep.title}</div>
                            <div class="ep-date-text">Released View Node</div>
                        </div>
                        <span class="watched-badge">Watched</span>
                    </a>
                `;
                scrollBox.insertAdjacentHTML("beforeend", itemHtml);
            });
        });
}