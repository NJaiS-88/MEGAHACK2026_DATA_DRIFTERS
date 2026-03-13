const ML_BASE = 'http://127.0.0.1:8005/api';

export const mlApi = {
    get: async (endpoint) => {
        const res = await fetch(`${ML_BASE}${endpoint}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ML Request failed');
        return data;
    },
    post: async (endpoint, body) => {
        const res = await fetch(`${ML_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'ML Request failed');
        return data;
    }
};
