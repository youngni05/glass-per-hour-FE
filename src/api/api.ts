// This is the base path that will be proxied by the React development server (see package.json "proxy")
const API_BASE_URL = 'http://118.218.130.193:8000/api';

// Backend User DTO to match API_SPEC_KR.md
export interface User {
    id: number;
    userName: string;
    joinedAt: string; // ISO-8601 date string
    finishedAt: string | null; // ISO-8601 date string or null
    totalSojuEquivalent: number;
    sojuCount: number;
    beerCount: number;
    somaekCount: number;
    makgeolliCount: number;
    fruitsojuCount: number;
    characterLevel: number | null;
    aiMessage: string | null;
    reactionTimes: number[];
}

// Corresponds to POST /api/users
export const createUser = async (userName: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
    }
    return response.json();
};

// Corresponds to POST /api/users/{userId}/finish
export const finishUser = async (userId: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/finish`, {
        method: "POST",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to finish user");
    }
    return response.json();
};

// Corresponds to POST /api/users/{userId}/drinks
export const addDrink = async (userId: number, drinkType: string, glassCount: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/drinks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // The body should only contain what the API expects, userId is in the path
        body: JSON.stringify({ drinkType, glassCount }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add drink");
    }
    return response.json();
};

// Corresponds to POST /api/users/{userId}/reaction
export const recordReaction = async (userId: number, reactionTimeMs: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reaction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ reactionTimeMs }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record reaction time");
    }
    return response.json();
};

// Corresponds to GET /api/users/{userId}/ai-message
export const getAiMessage = async (userId: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/ai-message`, {
        method: "GET",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get AI message");
    }
    return response.json();
};

// Corresponds to GET /api/rankings
export const getRankings = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/rankings`, {
        method: "GET",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get rankings");
    }
    return response.json();
};

// Corresponds to GET /api/users/{userId}
export const getUser = async (userId: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get user");
    }
    return response.json();
};
