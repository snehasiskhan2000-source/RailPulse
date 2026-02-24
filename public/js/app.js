let currentFocus = null;

// Page Navigation
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Autocomplete Search (Matches Image 2)
[fromInput, toInput].forEach(el => {
    el.addEventListener('input', async (e) => {
        const val = e.target.value;
        if (val.length < 2) return document.getElementById('autocomplete-list').classList.add('hidden');
        
        const res = await fetch(`/api/stations?q=${val}`);
        const data = await res.json();
        
        const list = document.getElementById('autocomplete-list');
        list.innerHTML = data.map(s => `
            <div class="suggest" onclick="selectStation('${el.id}', '${s.name}', '${s.code}')">
                <span class="badge">${s.code}</span>
                <span class="name">${s.name}</span>
            </div>
        `).join('');
        list.classList.remove('hidden');
    });
});

function selectStation(id, name, code) {
    document.getElementById(id).value = `${name} (${code})`;
    document.getElementById(id).dataset.code = code;
    document.getElementById('autocomplete-list').classList.add('hidden');
}

// Search Results (Matches Image 3)
document.getElementById('findBtn').addEventListener('click', async () => {
    const from = document.getElementById('fromInput').dataset.code;
    const to = document.getElementById('toInput').dataset.code;
    
    showView('results-view');
    const res = await fetch(`/api/search-trains?from=${from}&to=${to}`);
    const trains = await res.json();
    
    document.getElementById('train-container').innerHTML = trains.map(t => `
        <div class="train-item" onclick="getLiveStatus('${t.number}', '${t.name}')">
            <div class="t-row"><b>${t.number}</b> <span>${t.departure} — ${t.arrival}</span></div>
            <div class="t-name">${t.name}</div>
            <div class="t-status">Runs Daily</div>
        </div>
    `).join('');
});

// Live Timeline Logic (Matches Image 4)
async function getLiveStatus(num, name) {
    showView('live-view');
    document.getElementById('live-train-info').innerText = `${num} - ${name}`;
    const res = await fetch(`/api/live-status/${num}`);
    const data = await res.json();
    
    document.getElementById('live-timeline').innerHTML = data.route.map(stop => `
        <div class="timeline-stop">
            <div class="time">${stop.arrival || stop.departure}</div>
            <div class="node"></div>
            <div class="details">
                <b>${stop.station_name}</b>
                <p>Platform ${stop.platform || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}
