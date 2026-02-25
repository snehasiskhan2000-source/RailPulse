async function setupAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length < 2) return dropdown.classList.add('hidden');

        const res = await fetch(`/api/stations/search?q=${query}`);
        const data = await res.json();

        dropdown.innerHTML = data.map(s => `
            <div class="drop-item" onclick="selectStation('${inputId}', '${s.name}', '${s.code}', '${dropdownId}')">
                <span class="stn-name">${s.name}</span>
                <span class="stn-code">${s.code}</span>
            </div>
        `).join('');
        dropdown.classList.remove('hidden');
    });
}

function selectStation(inputId, name, code, dropdownId) {
    const input = document.getElementById(inputId);
    input.value = `${name} (${code})`;
    input.dataset.code = code; // Save code for searching
    document.getElementById(dropdownId).classList.add('hidden');
}

async function findTrains() {
    const fromCode = document.getElementById('fromInput').dataset.code;
    const toCode = document.getElementById('toInput').dataset.code;
    const container = document.getElementById('resultsContainer');

    if (!fromCode || !toCode) {
        alert("Please select stations from the dropdown list.");
        return;
    }

    container.innerHTML = '<p class="loading-text">Searching trains...</p>';

    const res = await fetch(`/api/trains/find?from=${fromCode}&to=${toCode}`);
    const trains = await res.json();

    if (trains.length === 0) {
        container.innerHTML = '<p class="loading-text">No trains found for this route.</p>';
        return;
    }

    container.innerHTML = trains.map(train => `
        <div class="train-card" onclick="getLiveStatus('${train.number}')">
            <div class="route-line">
                <div>
                    <span class="stn-code" style="color:var(--accent)">${train.number}</span>
                    <h3 style="margin:5px 0">${train.name}</h3>
                </div>
            </div>
            <div class="tap-hint">📍 Tap to Track Live Location</div>
            <div id="live-${train.number}" class="live-panel hidden"></div>
        </div>
    `).join('');
}

async function getLiveStatus(trainNo) {
    const panel = document.getElementById(`live-${trainNo}`);
    if (!panel.classList.contains('hidden')) {
        return panel.classList.add('hidden');
    }

    panel.innerHTML = "🛰️ Contacting Satellite...";
    panel.classList.remove('hidden');

    try {
        const res = await fetch(`/api/train/live/${trainNo}`);
        const json = await res.json();
        
        if (json.body) {
            panel.innerHTML = `
                <div class="live-info">
                    <p><strong>Current:</strong> ${json.body.current_station || 'Unknown'}</p>
                    <p><strong>Status:</strong> ${json.body.train_status_message || 'In Transit'}</p>
                </div>
            `;
        } else {
            panel.innerHTML = "Live status currently unavailable.";
        }
    } catch (e) {
        panel.innerHTML = "Error fetching live tracking data.";
    }
}

// Initialize
setupAutocomplete('fromInput', 'fromDropdown');
setupAutocomplete('toInput', 'toDropdown');
