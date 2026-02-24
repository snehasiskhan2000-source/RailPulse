const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const autoList = document.getElementById('autocomplete-list');

async function handleSearch(inputElement) {
    const query = inputElement.value;
    if (query.length < 2) {
        autoList.style.display = 'none';
        return;
    }

    try {
        // Absolute path for reliability
        const response = await fetch(`/api/stations?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.length > 0) {
            autoList.innerHTML = data.map(station => `
                <div class="suggest-row" onclick="selectStn('${inputElement.id}', '${station.name}', '${station.code}')">
                    <span class="stn-code">${station.code}</span>
                    <span class="stn-name">${station.name}</span>
                </div>
            `).join('');
            autoList.style.display = 'block';
        } else {
            autoList.style.display = 'none';
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

fromInput.addEventListener('input', () => handleSearch(fromInput));
toInput.addEventListener('input', () => handleSearch(toInput));

window.selectStn = (inputId, name, code) => {
    const input = document.getElementById(inputId);
    input.value = `${name} (${code})`;
    input.dataset.code = code; // This allows the "Find trains" button to work
    autoList.style.display = 'none';
};
