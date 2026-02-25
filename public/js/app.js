let fromCode = "", toCode = "";

function showScreen(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Station Autocomplete
async function setupInp(id, dropId) {
    const inp = document.getElementById(id);
    const drop = document.getElementById(dropId);
    inp.oninput = async () => {
        if (inp.value.length < 2) return;
        const res = await fetch(`/api/stations/search?q=${inp.value}`);
        const data = await res.json();
        drop.innerHTML = data.map(s => `<div class="drop-item" onclick="pick('${id}','${s.name}','${s.code}','${dropId}')"><b>${s.code}</b> ${s.name}</div>`).join('');
        drop.classList.remove('hidden');
    };
}

function pick(id, name, code, dropId) {
    document.getElementById(id).value = `${name} (${code})`;
    if (id === 'fromInput') fromCode = code; else toCode = code;
    document.getElementById(dropId).classList.add('hidden');
}

// Search Function
async function searchTrains() {
    if (!fromCode || !toCode) return alert("Select stations");
    showScreen('screen-results');
    document.getElementById('route-text').innerText = `${fromCode} → ${toCode}`;
    
    const res = await fetch(`/api/trains/find?from=${fromCode}&to=${toCode}`);
    const trains = await res.json();
    
    document.getElementById('results-list').innerHTML = trains.map(t => `
        <div class="train-item" onclick="getLive('${t.number}','${t.name}')">
            <div style="color:var(--blue); font-size:12px; font-weight:bold">${t.number}</div>
            <div style="font-weight:bold; margin:5px 0">${t.name}</div>
            <div style="display:flex; justify-content:space-between; font-size:14px; color:#aaa">
                <span>${t.stops[0].departure}</span><span>${t.stops[t.stops.length-1].arrival}</span>
            </div>
        </div>`).join('') || "No trains found.";
}

// Live Status Timeline
async function getLive(num, name) {
    showScreen('screen-live');
    document.getElementById('train-name-text').innerText = `${num} - ${name}`;
    const list = document.getElementById('live-timeline');
    list.innerHTML = "Fetching status...";

    try {
        const res = await fetch(`/api/train/live/${num}`);
        const data = await res.json();
        if (data.body && data.body.stations) {
            list.innerHTML = data.body.stations.map((s, i) => `
                <div class="timeline-item">
                    ${i < data.body.stations.length - 1 ? '<div class="t-line"></div>' : ''}
                    <div class="t-dot"></div>
                    <div class="stn-info">
                        <div><b>${s.stationName}</b><br><small style="color:#888">PF: ${s.platform || '--'}</small></div>
                        <div style="text-align:right"><b>${s.arrivalTime || s.departureTime}</b></div>
                    </div>
                </div>`).join('');
        }
    } catch (e) { list.innerHTML = "Error loading live data."; }
}

setupInp('fromInput', 'fromDrop'); setupInp('toInput', 'toDrop');
