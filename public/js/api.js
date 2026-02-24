const API = {
    async fetchStations(query) {
        const res = await fetch(`/api/stations?q=${query}`);
        return await res.json();
    },
    async fetchLiveStatus(trainNo) {
        const res = await fetch(`/api/live-status/${trainNo}`);
        return await res.json();
    }
};
