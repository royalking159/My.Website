document.addEventListener("DOMContentLoaded", () => {
    const isLibraryPage = document.getElementById("movie-grid");
    const isDetailsPage = document.getElementById("details-container");

    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            if (isLibraryPage) {
                renderLibrary(data.catalog);
            } else if (isDetailsPage) {
                renderDetails(data.catalog);
            }
        })
        .catch(err => console.error("Error loading JSON:", err));
});

function renderLibrary(catalog) {
    const grid = document.getElementById("movie-grid");
    if (!grid) return;
    grid.innerHTML = "";

    catalog.forEach(item => {
        const card = document.createElement("a");
        card.href = `movie-details.html?id=${item.id}`;
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${item.poster}" alt="${item.name}" class="movie-poster">
            <h3>${item.name}</h3>
            <div style="color: #aaa; font-size: 12px;">${item.releaseDate}</div>
        `;
        grid.appendChild(card);
    });
}

function renderDetails(catalog) {
    const container = document.getElementById("details-container");
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");
    const show = catalog.find(item => item.id === movieId);

    if (!show) {
        container.innerHTML = "<h2>Show not found!</h2>";
        return;
    }

    let episodesHTML = "";
    show.seasons.forEach(season => {
        episodesHTML += `<h3 style="color: #8b5cf6; margin-top: 30px; font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 5px;">${season.seasonName}</h3><ul>`;
        
        season.episodes.forEach(ep => {
            episodesHTML += `
                <li class="episode-item">
                    <div class="thumb-container">
                        <img src="${ep.thumbnail || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=320'}" class="episode-thumb" alt="${ep.title}">
                        <a href="${ep.playLink || '#'}" target="_blank" class="play-overlay">▶</a>
                    </div>
                    <div class="episode-details">
                        <div class="episode-header">
                            <span class="episode-title">Episode ${ep.ep}: ${ep.title}</span>
                            <a href="${ep.playLink || '#'}" target="_blank" class="btn-play">Play</a>
                        </div>
                        <div class="episode-desc">${ep.description}</div>
                    </div>
                </li>
            `;
        });
        episodesHTML += `</ul>`;
    });

    container.innerHTML = `
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <img src="${show.poster}" style="width: 300px; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); object-fit: cover;">
            <div style="flex: 1; min-width: 300px;">
                <h1 style="margin-top: 0; font-size: 40px; color: #8b5cf6;">${show.name}</h1>
                <div class="metadata">
                    <strong>Released:</strong> ${show.releaseDate} | <strong>Status:</strong> ${show.endDate} <br><br>
                    <strong>Genres:</strong> ${show.genres.join(", ")} <br><br>
                    <strong>Cast:</strong> ${show.cast.join(", ")}
                </div>
                <p style="line-height: 1.6; font-size: 18px;">${show.description}</p>
            </div>
        </div>
        <div class="episodes-list">
            <h2>Episodes & Content</h2>
            ${episodesHTML}
        </div>
    `;
}