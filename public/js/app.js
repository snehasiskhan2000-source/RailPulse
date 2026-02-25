// Global State
let selectedFrom = null;
let selectedTo = null;

// View Navigation
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

// Station Search Logic
async function initSearch(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener('input', async () => {
        if (input.value.length < 2) return dropdown.classList.add('hidden');
        const res = await fetch(`/api/stations/search?q=${input.value}`);
        const data = await res.json();
        
        dropdown.innerHTML = data.map(s => `
            <div class="drop-item" onclick="selectStation('${inputId}', '${s.name}', '${s.code}', '${dropdownId}')">
                <b>${s.code}</b> - ${s.name}
            </div>
        `).join('');
        dropdown.classList.remove('hidden');
    });
}

function selectStation(inputId, name, code, dropdownId) {
    const input = document.getElementById(inputId);
    input.value = `${name} (${code})`;
    if (inputId === 'fromInput') selectedFrom = code;
    else selectedTo = code;
    document.getElementById(dropdownId).classList.add('hidden');
}

// Find Trains
async function findTrains() {
    if (!selectedFrom || !selectedTo) return alert("Select stations first!");
    
    document.getElementById('route-display').innerText = `${selectedFrom} → ${selectedTo}`;
    const list = document.getElementById('resultsList');
    list.innerHTML = "<p>Finding trains...</p>";
    showView('view-results');

    const res = await fetch(`/api/trains/find?from=${selectedFrom}&to=${selectedTo}`);
    const trains = await res.json();

    list.innerHTML = trains.map(t => `
        <div class="train-item" onclick="getLiveStatus('${t.number}', '${t.name}')">
            <div class="train-head">
                <span class="train-num">${t.number}</span>
                <span style="color:#4ade80; font-size:12px">Runs Daily</span>
            </div>
            <div style="font-weight:bold; margin-bottom:10px">${t.name}</div>
            <div class="train-head" style="color:var(--dim); font-size:14px">
                <span>${t.stops[0].departure}</span>
                <span>${t.stops[t.stops.length-1].arrival}</span>
            </div>
        </div>
    `).join('') || "<p>No trains found.</p>";
}

// Live Status Logic
async function getLiveStatus(num, name) {
    document.getElementById('live-train-display').innerText = `${num} - ${name}`;
    const content = document.getElementById('liveContent');
    content.innerHTML = "<p>Fetching live timeline...</p>";
    showView('view-live');

    try {
        const res = await fetch(`/api/train/live/${num}`);
        const data = await res.json();
        
        if (data.body && data.body.stations) {
            content.innerHTML = data.body.stations.map((stn, i) => `
                <div class="timeline-item">
                    ${i < data.body.stations.length - 1 ? '<div class="t-line"></div>' : ''}
                    <div class="t-dot"></div>
                    <div class="stn-main">
                        <div>
                            <div style="font-weight:bold">${stn.stationName}</div>
                            <div style="font-size:12px; color:var(--dim)">Platform ${stn.platform || '--'}</div>
                        </div>
                        <div style="text-align:right">
                            <div style="font-weight:bold">${stn.arrivalTime || stn.departureTime}</div>
                            <div class="delay-text">${stn.actualArrival || ''}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { content.innerHTML = "<p>Live status unavailable.</p>"; }
}

function swapStations() {
    const from = document.getElementById('fromInput');
    const to = document.getElementById('toInput');
    const tempVal = from.value;
    from.value = to.value;
    to.value = tempVal;
    [selectedFrom, selectedTo] = [selectedTo, selectedFrom];
}

initSearch('fromInput', 'fromDropdown');
initSearch('toInput', 'toDropdown');
