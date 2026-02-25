// Navigation Helper
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

// Find Trains logic
async function findTrains() {
    const from = document.getElementById('fromInput').dataset.code;
    const to = document.getElementById('toInput').dataset.code;
    
    const res = await fetch(`/api/trains/find?from=${from}&to=${to}`);
    const trains = await res.json();
    
    document.getElementById('route-title').innerText = `${from} → ${to}`;
    const list = document.getElementById('resultsList');
    
    list.innerHTML = trains.map(t => `
        <div class="train-card" onclick="openLiveTracking('${t.number}', '${t.name}')">
            <div class="train-no">${t.number}</div>
            <div class="train-row">
                <span>${t.name}</span>
                <span>Runs Daily</span>
            </div>
            <div class="train-row" style="margin-top:10px; font-size:14px; color:var(--text-dim)">
                <span>${t.stops[0].departure}</span>
                <span>${t.stops[t.stops.length-1].arrival}</span>
            </div>
        </div>
    `).join('');
    
    showView('view-results');
}

// Live Tracking logic (Timeline generation)
async function openLiveTracking(trainNo, trainName) {
    document.getElementById('live-train-title').innerText = `${trainNo} - ${trainName}`;
    const container = document.getElementById('liveTrackingContent');
    container.innerHTML = "<p>Loading live timeline...</p>";
    showView('view-live');

    try {
        const res = await fetch(`/api/train/live/${trainNo}`);
        const data = await res.json();
        
        if (data.body && data.body.stations) {
            container.innerHTML = data.body.stations.map(stn => `
                <div class="timeline-item">
                    <div class="timeline-line"></div>
                    <div class="timeline-dot"></div>
                    <div class="stn-info">
                        <div class="train-row">
                            <span>${stn.stationName}</span>
                            <span class="arrival-time">${stn.actualArrival || stn.arrivalTime}</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-dim)">
                            Platform ${stn.platform || 'N/A'} • ${stn.distance} km
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        container.innerHTML = "<p>Unable to fetch live data.</p>";
    }
}

// Initialize Station Dropdowns (Reuse your existing logic here)
// ... setupAutocomplete('fromInput', 'fromDropdown'); ...
