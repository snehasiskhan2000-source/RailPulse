const RailAPI = {
    async searchStations(query) {
        try {
            const response = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}`);
            return await response.json();
        } catch (err) {
            console.error("Autocomplete error:", err);
            return [];
        }
    },

    async findTrains(from, to) {
        try {
            const response = await fetch(`/api/trains/find?from=${from}&to=${to}`);
            return await response.json();
        } catch (err) {
            console.error("Search error:", err);
            return [];
        }
    }
};
