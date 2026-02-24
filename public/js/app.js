let currentInput = null;

// Page Switching Logic
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// Autocomplete Logic
const fromInput = document.getElementById('from-stn');
const toInput = document.getElementById('to-stn');
const resultsDiv = document.getElementById('autocomplete-results');

[fromInput, toInput].forEach(input => {
    input.addEventListener('input', async (e) => {
        currentInput = e.target;
        const val = e.target.value;
        if(val.length < 2) return resultsDiv.classList.add('hidden');
        
        const data = await API.fetchStations(val);
        renderSuggestions(data);
    });
});

function renderSuggestions(data) {
    resultsDiv.innerHTML = data.map(s => `
        <div class="suggestion" onclick="selectStation('${s.name}', '${s.code}')">
            <span>${s.name}</span>
            <span class="code">${s.code}</span>
        </div>
    `).join('');
    resultsDiv.classList.remove('hidden');
}

window.selectStation = (name, code) => {
    currentInput.value = `${name} (${code})`;
    resultsDiv.classList.add('hidden');
};

// Find Train Click
document.getElementById('find-train-btn').addEventListener('click', () => {
    document.getElementById('route-text').innerText = `${fromInput.value} → ${toInput.value}`;
    showPage('list-screen');
    // Here you would normally fetch trains between stations
    renderDummyTrains();
});

function renderDummyTrains() {
    const container = document.getElementById('train-results-container');
    container.innerHTML = `
        <div class="search-card" onclick="showLiveStatus('12301')">
            <div style="display:flex; justify-content:space-between">
                <b>12301 - Rajdhani Exp</b>
                <span style="color:var(--primary)">Runs Daily</span>
            </div>
            <p style="color:var(--subtext); margin:5px 0">16:55 - 10:00 (17h 05m)</p>
        </div>
    `;
}

async function showLiveStatus(trainNo) {
    showPage('live-screen');
    document.getElementById('live-timeline').innerHTML = "<p style='padding:20px'>Loading Live Status...</p>";
    
    // In real app: const data = await API.fetchLiveStatus(trainNo);
    // Dummy Timeline UI
    setTimeout(() => {
        document.getElementById('live-timeline').innerHTML = `
            <div class="timeline-item">
                <div class="station-dot"></div>
                <div>
                    <b>Howrah Jn</b><br>
                    <small>Platform 9 • Departed 17:00</small>
                </div>
            </div>
            <div class="timeline-item">
                <div class="station-dot" style="background:var(--primary)"></div>
                <div>
                    <b>Dhanbad Jn</b><br>
                    <small style="color:var(--primary)">Arrived 20:30 (On Time)</small>
                </div>
            </div>
        `;
    }, 1000);
}
