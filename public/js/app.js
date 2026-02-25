document.addEventListener('DOMContentLoaded', () => {
    const fromInput = document.getElementById('fromStation');
    const toInput = document.getElementById('toStation');
    const fromDrop = document.getElementById('fromDropdown');
    const toDrop = document.getElementById('toDropdown');
    const searchBtn = document.getElementById('findTrainsBtn');
    const resultsContainer = document.getElementById('resultsList');

    // Helper: Handle Autocomplete Logic
    const initAutocomplete = (input, dropdown) => {
        input.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                dropdown.classList.add('hidden');
                return;
            }

            const stations = await RailAPI.searchStations(query);
            if (stations.length > 0) {
                dropdown.innerHTML = stations.map(s => `
                    <div class="drop-item" data-code="${s.code}" data-name="${s.name}">
                        <div class="stn-info">
                            <span class="stn-name">${s.name}</span>
                            <span class="stn-code">${s.code}</span>
                        </div>
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                `).join('');
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        });
    };

    // Global click listener for selection
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.drop-item');
        if (item) {
            const dropdown = item.parentElement;
            const targetInput = dropdown.id === 'fromDropdown' ? fromInput : toInput;
            targetInput.value = `${item.dataset.name} (${item.dataset.code})`;
            targetInput.dataset.selectedCode = item.dataset.code;
            dropdown.classList.add('hidden');
        } else if (!e.target.closest('.input-wrapper')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.add('hidden'));
        }
    });

    // Search Logic
    searchBtn.onclick = async () => {
        const from = fromInput.dataset.selectedCode;
        const to = toInput.dataset.selectedCode;

        if (!from || !to) return alert("Please select stations from the list!");

        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        const trains = await RailAPI.findTrains(from, to);
        searchBtn.innerHTML = 'Find Trains';

        resultsContainer.innerHTML = trains.map(t => `
            <div class="train-card">
                <div class="card-top">
                    <span class="train-num">${t.number}</span>
                    <span class="train-days">Daily</span>
                </div>
                <h3 class="train-name">${t.name}</h3>
                <div class="route-line">
                    <div class="point">
                        <span class="time">${t.stops.find(s => s.station_code === from).departure}</span>
                        <span class="stn">${from}</span>
                    </div>
                    <div class="arrow"></div>
                    <div class="point">
                        <span class="time">${t.stops.find(s => s.station_code === to).arrival}</span>
                        <span class="stn">${to}</span>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="no-results">No trains found for this route.</div>';
    };

    initAutocomplete(fromInput, fromDrop);
    initAutocomplete(toInput, toDrop);
});
