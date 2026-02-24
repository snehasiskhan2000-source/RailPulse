const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const autoBox = document.getElementById('autocomplete-list');

// Function to handle autocomplete for both inputs
[fromInput, toInput].forEach(input => {
    input.addEventListener('input', async (e) => {
        const val = e.target.value;
        
        // Hide list if input is too short
        if (val.length < 2) {
            autoBox.classList.add('hidden');
            return;
        }

        try {
            // Use relative path for Render
            const res = await fetch(`/api/stations?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            
            if (data.length > 0) {
                autoBox.innerHTML = data.map(s => `
                    <div class="suggest" onclick="selectStation('${input.id}', '${s.name}', '${s.code}')">
                        <span class="badge">${s.code}</span>
                        <span class="name">${s.name}</span>
                    </div>
                `).join('');
                autoBox.classList.remove('hidden');
                
                // Position the box below the active input
                const rect = input.getBoundingClientRect();
                autoBox.style.top = (rect.bottom + window.scrollY) + 'px';
            } else {
                autoBox.classList.add('hidden');
            }
        } catch (err) {
            console.error("Autocomplete error:", err);
        }
    });
});

// Global function so onclick works
window.selectStation = (inputId, name, code) => {
    const input = document.getElementById(inputId);
    input.value = name; // Set visible text
    input.dataset.code = code; // Store code for the "Find trains" logic
    autoBox.classList.add('hidden');
};

// Close autocomplete when clicking outside
document.addEventListener('click', (e) => {
    if (!autoBox.contains(e.target) && e.target !== fromInput && e.target !== toInput) {
        autoBox.classList.add('hidden');
    }
});
