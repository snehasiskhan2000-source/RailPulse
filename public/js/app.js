// Autocomplete Trigger
const searchInput = document.getElementById('fromInput');
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if(query.length < 2) return;

    const res = await fetch(`/api/stations?q=${query}`);
    const data = await res.json();
    
    const box = document.getElementById('autocomplete-box');
    box.innerHTML = data.map(item => `
        <div class="suggestion-item" onclick="setStation('fromInput', '${item.name}', '${item.code}')">
            <span>${item.name}</span>
            <span class="code">${item.code}</span>
        </div>
    `).join('');
});

function setStation(id, name, code) {
    document.getElementById(id).value = `${name} (${code})`;
    document.getElementById(id).dataset.code = code;
    document.getElementById('autocomplete-box').innerHTML = '';
}

// Search Function
document.getElementById('findBtn').addEventListener('click', async () => {
    const from = document.getElementById('fromInput').dataset.code;
    const to = document.getElementById('toInput').dataset.code;
    
    const res = await fetch(`/api/search?from=${from}&to=${to}`);
    const trains = await res.json();
    
    renderResults(trains);
});
