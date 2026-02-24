async function search() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;

  const res = await fetch(`/api/search?from=${from}&to=${to}`);
  const trains = await res.json();

  const results = document.getElementById("results");
  results.innerHTML = "";

  trains.forEach(t => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `Train ${t.train_number}`;
    div.onclick = () => loadTrain(t.train_number);
    results.appendChild(div);
  });
}

async function loadTrain(trainNo) {
  const res = await fetch(`/api/train/${trainNo}`);
  const schedule = await res.json();

  const timetable = document.getElementById("timetable");
  timetable.innerHTML = "<h2>Timetable</h2>";

  schedule.forEach(s => {
    timetable.innerHTML += `
      <div class="card">
        ${s.station_code} - ${s.arrival} → ${s.departure}
      </div>
    `;
  });
}
