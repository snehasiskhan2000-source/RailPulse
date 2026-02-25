// Display results and enable tap-to-track
function displayTrains(trains) {
    const container = document.getElementById('resultsContainer');
    if (trains.length === 0) {
        container.innerHTML = '<p>No trains found.</p>';
        return;
    }

    container.innerHTML = trains.map(train => `
        <div class="train-card" onclick="fetchLiveStatus('${train.number}')">
            <div class="card-main">
                <span class="t-no">${train.number}</span>
                <span class="t-name">${train.name}</span>
            </div>
            <div class="tap-hint">Tap to see live location 📍</div>
            <div id="status-${train.number}" class="live-panel" style="display:none"></div>
        </div>
    `).join('');
}

// Fetch live status from your proxy
async function fetchLiveStatus(trainNo) {
    const panel = document.getElementById(`status-${trainNo}`);
    
    if (panel.style.display === "block") {
        panel.style.display = "none";
        return;
    }

    panel.innerHTML = "🛰️ Locating train...";
    panel.style.display = "block";

    try {
        const res = await fetch(`/api/train/live/${trainNo}`);
        const result = await res.json();

        if (result.body) {
            const info = result.body;
            panel.innerHTML = `
                <div class="live-info">
                    <p><strong>At:</strong> ${info.current_station || 'N/A'}</p>
                    <p><strong>Status:</strong> ${info.train_status_message || 'Running'}</p>
                    <small>Last updated: ${info.server_timestamp || ''}</small>
                </div>
            `;
        } else {
            panel.innerHTML = "Status not available for this train today.";
        }
    } catch (e) {
        panel.innerHTML = "Tracking currently unavailable.";
    }
}
