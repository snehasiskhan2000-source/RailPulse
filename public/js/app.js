const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const autoList = document.getElementById('auto-list');

async function handleTyping(e) {
    const input = e.target;
    const query = input.value;

    if (query.length < 2) {
        autoList.classList.add('hidden');
        return;
    }

    const res = await fetch(`/api/stations?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.length > 0) {
        autoList.innerHTML = data.map(s => `
            <div class="item" onclick="selectStn('${input.id}', '${s.name}', '${s.code}')">
                <span class="badge">${s.code}</span>
                <span>${s.name}</span>
            </div>
        `).join('');
        
        // Dynamic positioning to avoid being hidden by keyboard
        const rect = input.getBoundingClientRect();
        autoList.style.top = (input.offsetTop + 45) + "px";
        autoList.classList.remove('hidden');
    }
}

window.selectStn = (id, name, code) => {
    const input = document.getElementById(id);
    input.value = name;
    input.dataset.code = code; // Saves the code for searching
    autoList.classList.add('hidden');
};

fromInput.addEventListener('input', handleTyping);
toInput.addEventListener('input', handleTyping);

document.getElementById('findBtn').onclick = async () => {
    const from = fromInput.dataset.code;
    const to = toInput.dataset.code;

    if (!from || !to) return alert("Please select stations from the list");

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');

    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();

    document.getElementById('train-list').innerHTML = trains.map(t => `
        <div class="train-card">
            <div class="card-top">
                <span class="t-number">${t.number}</span>
                <span class="t-time">${t.departure} — ${t.arrival}</span>
            </div>
            <div class="t-name">${t.name}</div>
        </div>
    `).join('');
};
