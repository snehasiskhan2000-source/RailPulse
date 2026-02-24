const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const suggestList = document.getElementById('suggest-list');

// 1. Live Autocomplete logic (Image 1 & 2)
[fromInput, toInput].forEach(el => {
    el.addEventListener('input', async (e) => {
        if (e.target.value.length < 2) return suggestList.classList.add('hidden');
        const res = await fetch(`/api/stations?q=${e.target.value}`);
        const data = await res.json();
        
        suggestList.innerHTML = data.map(s => `
            <div class="suggest-item" onclick="selectStn('${el.id}', '${s.name}', '${s.code}')">
                <span class="stn-badge">${s.code}</span>
                <span class="stn-name">${s.name}</span>
            </div>
        `).join('');
        suggestList.classList.remove('hidden');
    });
});

function selectStn(inputId, name, code) {
    document.getElementById(inputId).value = `${name} (${code})`;
    document.getElementById(inputId).dataset.code = code;
    suggestList.classList.add('hidden');
}

// 2. Search Results (Image 3)
document.getElementById('searchBtn').addEventListener('click', async () => {
    const from = fromInput.dataset.code;
    const to = toInput.dataset.code;
    
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('results-page').classList.remove('hidden');
    
    const res = await fetch(`/api/search-trains?from=${from}&to=${to}`);
    const trains = await res.json();
    
    document.getElementById('train-list-container').innerHTML = trains.map(t => `
        <div class="train-card" onclick="showLive('${t.number}', '${t.name}')">
            <div class="t-top">
                <span class="t-no">${t.number}</span>
                <span class="t-time">${t.departure} — ${t.arrival}</span>
            </div>
            <div class="t-name">${t.name}</div>
            <div class="t-days">Runs Daily</div>
        </div>
    `).join('');
});

// 3. Live Status Timeline (Image 4)
async function showLive(num, name) {
    document.getElementById('results-page').classList.add('hidden');
    document.getElementById('live-page').classList.remove('hidden');
    document.getElementById('train-name-top').innerText = `${num} - ${name}`;
    
    // Fetch live data from RapidAPI
    const res = await fetch(`/api/live-status/${num}`);
    const data = await res.json();
    
    // Generate high-end timeline matching Image 4
    document.getElementById('timeline').innerHTML = data.route.map(stop => `
        <div class="stop">
            <div class="stop-time">${stop.arrival || stop.departure}</div>
            <div class="stop-line"></div>
            <div class="stop-info">
                <b>${stop.station_name}</b>
                <small>Platform ${stop.platform || 'N/A'}</small>
            </div>
        </div>
    `).join('');
}
