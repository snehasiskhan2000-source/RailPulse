const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const autoBox = document.getElementById('autocomplete-list');

// Handle typing for both inputs
[fromInput, toInput].forEach(input => {
    input.addEventListener('input', async (e) => {
        const val = e.target.value;
        if (val.length < 2) {
            autoBox.classList.add('hidden');
            return;
        }

        try {
            // Relative URL for Render
            const res = await fetch(`/api/stations?q=${val}`);
            const data = await res.json();
            
            autoBox.innerHTML = data.map(s => `
                <div class="suggest" onclick="select('${input.id}', '${s.name}', '${s.code}')">
                    <span class="badge">${s.code}</span>
                    <span class="name">${s.name}</span>
                </div>
            `).join('');
            autoBox.classList.remove('hidden');
        } catch (err) {
            console.error("Autocomplete failed");
        }
    });
});

function select(id, name, code) {
    const el = document.getElementById(id);
    el.value = `${name} (${code})`;
    el.dataset.code = code;
    autoBox.classList.add('hidden');
}

document.getElementById('findBtn').addEventListener('click', async () => {
    const from = fromInput.dataset.code;
    const to = toInput.dataset.code;
    
    if(!from || !to) return alert("Please select stations from the list");

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');
    
    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();
    
    // Render search results matching Image 4
    const container = document.getElementById('train-container');
    container.innerHTML = trains.map(t => `
        <div class="train-item" onclick="getLive('${t.number}')">
            <div class="t-row"><b>${t.number}</b> <span>${t.departure} — ${t.arrival}</span></div>
            <div class="t-name">${t.name}</div>
        </div>
    `).join('');
});
