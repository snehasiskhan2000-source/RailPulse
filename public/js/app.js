const fromInp = document.getElementById('fromInput');
const toInp = document.getElementById('toInput');
const list = document.getElementById('autocomplete-list');

// Function for typing
[fromInp, toInp].forEach(input => {
    input.addEventListener('input', async () => {
        const val = input.value;
        if (val.length < 2) {
            list.classList.add('hidden');
            return;
        }

        const res = await fetch(`/api/stations?q=${val}`);
        const data = await res.json();

        if (data.length > 0) {
            list.innerHTML = data.map(s => `
                <div class="item" onclick="pick('${input.id}', '${s.name}', '${s.code}')">
                    <span class="code-badge">${s.code}</span>
                    <span>${s.name}</span>
                </div>
            `).join('');
            list.classList.remove('hidden');
        }
    });
});

// Function to pick station
window.pick = (id, name, code) => {
    const el = document.getElementById(id);
    el.value = name;
    el.dataset.code = code; // Crucial for search!
    list.classList.add('hidden');
};

// Search trigger
document.getElementById('findBtn').onclick = async () => {
    const from = fromInp.dataset.code;
    const to = toInp.dataset.code;

    if (!from || !to) {
        alert("Please select stations from the list");
        return;
    }

    document.getElementById('home-view').classList.add('hidden');
    const resView = document.getElementById('results-view');
    resView.classList.remove('hidden');

    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();

    document.getElementById('train-list').innerHTML = trains.map(t => `
        <div class="t-card">
            <div class="t-head">
                <span class="t-no">${t.number}</span>
                <span>${t.departure} — ${t.arrival}</span>
            </div>
            <div class="t-name">${t.name}</div>
        </div>
    `).join('');
};
