// Autocomplete logic (Simplified for brevity)
async function handleSearch(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    input.addEventListener('input', async (e) => {
        const q = e.target.value;
        if (q.length < 2) return dropdown.classList.add('hidden');
        
        const res = await fetch(`/api/stations/search?q=${q}`);
        const data = await res.json();
        
        dropdown.innerHTML = data.map(s => `
            <div class="drop-item" onclick="selectStation('${inputId}', '${s.name} (${s.code})', '${dropdownId}')">
                <span>${s.name}</span>
                <span class="stn-code">${s.code}</span>
            </div>
        `).join('');
        dropdown.classList.remove('hidden');
    });
}

function selectStation(inputId, value, dropdownId) {
    document.getElementById(inputId).value = value;
    document.getElementById(dropdownId).classList.add('hidden');
}

// Search Trains
async function findTrains() {
    const fromVal = document.getElementById('fromInput').value;
    const toVal = document.getElementById('toInput').value;
    
    // Extract codes from "(CODE)" strings
    const fromCode = fromVal.match(/\((.*?)\)/)[1];
    const toCode = toVal.match(/\((.*?)\)/)[1];

    const res = await fetch(`/api/trains/find?from=${fromCode}&to=${toCode}`);
    const trains = await res.json();
    displayTrains(trains);
}

function displayTrains(trains) {
    const container = document.getElementById('resultsContainer');
    if (trains.length === 0) {
        container.innerHTML = '<p class="loading-text">No trains found for this route.</p>';
        return;
    }

    container.innerHTML = trains.map(train => `
        <div class="train-card" onclick="fetchLiveStatus('${train.number}')">
            <div class="card-main">
                <span class="time">${train.number}</span>
                <span class="stn">${train.name}</span>
            </div>
            <div class="tap-hint">📍 Tap for Live Location</div>
            <div id="live-${train.number}" class="live-panel" style="display:none"></div>
        </div>
    `).join('');
}

async function fetchLiveStatus(trainNo) {
    const panel = document.getElementById(`live-${trainNo}`);
    if (panel.style.display === "block") {
        panel.style.display = "none";
        return;
    }

    panel.innerHTML = '<p class="loading-text">🛰️ Locating train...</p>';
    panel.style.display = "block";

    try {
        const res = await fetch(`/api/train/live/${trainNo}`);
        const result = await res.json();

        if (result.body) {
            const data = result.body;
            panel.innerHTML = `
                <div class="live-info">
                    <p><strong>Current:</strong> ${data.current_station || 'N/A'}</p>
                    <p><strong>Status:</strong> ${data.train_status_message || 'Running'}</p>
                    <small>Updated: ${data.server_timestamp || ''}</small>
                </div>
            `;
        } else {
            panel.innerHTML = '<p>Live data unavailable for this train.</p>';
        }
    } catch (e) {
        panel.innerHTML = '<p>Error connecting to live tracking.</p>';
    }
}

// Init
handleSearch('fromInput', 'fromDropdown');
handleSearch('toInput', 'toDropdown');
