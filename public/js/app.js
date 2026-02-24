const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const autoBox = document.getElementById('autocomplete-list');

// Autocomplete Logic
[fromInput, toInput].forEach(input => {
    input.addEventListener('input', async (e) => {
        const val = e.target.value;
        if (val.length < 2) {
            autoBox.classList.add('hidden');
            return;
        }

        const res = await fetch(`/api/stations?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        
        if (data.length > 0) {
            autoBox.innerHTML = data.map(s => `
                <div class="suggest-item" onclick="selectStation('${input.id}', '${s.name}', '${s.code}')">
                    <span class="stn-code">${s.code}</span>
                    <span class="stn-name">${s.name}</span>
                </div>
            `).join('');
            autoBox.classList.remove('hidden');
            
            // Positioning the box
            const rect = input.getBoundingClientRect();
            autoBox.style.top = (rect.bottom + window.scrollY) + "px";
        }
    });
});

// Setting the station and storing the code (Fixes the Alert issue)
window.selectStation = (inputId, name, code) => {
    const el = document.getElementById(inputId);
    el.value = name;
    el.dataset.code = code; // Crucial for Find trains button
    autoBox.classList.add('hidden');
};

// Search Logic
document.getElementById('findBtn').addEventListener('click', async () => {
    const from = fromInput.dataset.code;
    const to = toInput.dataset.code;

    if (!from || !to) {
        alert("Please select stations from the list");
        return;
    }

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('results-view').classList.remove('hidden');

    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();
    
    // Display results matching Image 3
    document.getElementById('train-container').innerHTML = trains.map(t => `
        <div class="train-card">
            <div class="card-row">
                <span class="t-no">${t.number}</span>
                <span class="t-times">${t.departure} — ${t.arrival}</span>
            </div>
            <div class="t-name">${t.name}</div>
            <div class="t-footer">Runs Daily</div>
        </div>
    `).join('');
});
