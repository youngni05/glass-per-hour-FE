export const API_BASE_URL = "/api";

export interface CreateRoomRequest {
    roomName?: string;
    userName: string;
}

export interface CreateRoomResponse {
    roomCode: string;
    roomName: string;
    hostUserId: number;
    hostUserName: string;
}

export interface JoinRoomRequest {
    roomCode: string;
    userName: string;
}

export interface JoinRoomResponse {
    userId: number;
    userName: string;
    roomCode: string;
    roomName: string;
}

export interface DrinkAddRequest {
    userId: number;
    drinkType: string;
    amount: number;
}

export interface User {
    id: number;
    name: string;
    roomId: number;
    isHost: boolean;
    characterLevel: number;
    aiMessage: string;
    finalRank: number;
    funnyDescription: string;
    glassPerHour: number;
}

export const createRoom = async (userName: string, roomName?: string): Promise<CreateRoomResponse> => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, roomName }),
    });
    if (!response.ok) {
        throw new Error("Failed to create room");
    }
    return response.json();
};

export const joinRoom = async (roomCode: string, userName: string): Promise<JoinRoomResponse> => {
    const response = await fetch(`${API_BASE_URL}/rooms/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomCode, userName }),
    });
    if (!response.ok) {
        throw new Error("Failed to join room");
    }
    return response.json();
};

export const finishUser = async (userId: number): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/finish`, {
        method: "POST",
    });
    if (!response.ok) {
        throw new Error("Failed to finish user");
    }
    return response.json();
};

export const addDrink = async (userId: number, drinkType: string, amount: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/drinks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, drinkType, glassCount: amount }),
    });
    if (!response.ok) {
        throw new Error("Failed to add drink");
    }
    return response.json();
};
