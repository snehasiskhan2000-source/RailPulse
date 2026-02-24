const fromInp = document.getElementById('fromInput');
const toInp = document.getElementById('toInput');
const autoList = document.getElementById('auto-list');

// Professional Autocomplete Handler
async function getSuggestions(e) {
    const input = e.target;
    const val = input.value;

    if (val.length < 2) {
        autoList.classList.add('hidden');
        return;
    }

    const res = await fetch(`/api/stations?q=${encodeURIComponent(val)}`);
    const stations = await res.json();

    if (stations.length > 0) {
        autoList.innerHTML = stations.map(s => `
            <div class="suggest-item" onclick="selectStn('${input.id}', '${s.name}', '${s.code}')">
                <span class="stn-badge">${s.code}</span>
                <span>${s.name}</span>
            </div>
        `).join('');
        autoList.classList.remove('hidden');
        
        // Position list under active input
        const rect = input.getBoundingClientRect();
        autoList.style.top = (input.offsetTop + 50) + "px";
    }
}

window.selectStn = (id, name, code) => {
    const el = document.getElementById(id);
    el.value = name;
    el.dataset.code = code;
    autoList.classList.add('hidden');
};

fromInp.addEventListener('input', getSuggestions);
toInp.addEventListener('input', getSuggestions);

// Search Execution
document.getElementById('findBtn').onclick = async () => {
    const from = fromInp.dataset.code;
    const to = toInp.dataset.code;

    if (!from || !to) return alert("Select stations from list");

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');

    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();

    document.getElementById('train-results').innerHTML = trains.map(t => `
        <div class="train-card">
            <div class="t-row">
                <span class="t-num">${t.number}</span>
                <span class="t-time">${t.departure} — ${t.arrival}</span>
            </div>
            <div style="font-size: 14px; color: var(--subtext)">${t.name}</div>
        </div>
    `).join('');
};

document.getElementById('backBtn').onclick = () => location.reload();
