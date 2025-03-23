import axios from "axios";

const loginUser = async (username: string) => {
    return axios.post('http://localhost:3000/user', { username });
};

const registerUser = async (username: string) => {
    return axios.post('http://localhost:3000/user', { username });
};

const deleteUser = async (username: string) => {
    return axios.delete('http://localhost:3000/user', {
        params: { username }
        //use query, know which user to delete
    });
};

const saveUserState = async (username: string, gameState: any) => {
    return axios.put('http://localhost:3000/user', {
        username,
        ...gameState
    //    multiplierCost: gameState.multiplierCost
    });
};

//check if username exists
const checkUserExists = async (username: string): Promise<boolean> => {
    try {
        const response = await axios.get('http://localhost:3000/user/check', { params: { username } });
        const data = response.data as { exists: boolean };
        return data.exists;
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

//increment user points based on clickpower
const clickAction = async (username: string) => {
    return axios.put('http://localhost:3000/user', { username, action: "click" });
};

const upgradeClickPower = async (username: string) => {
    return axios.put('http://localhost:3000/user', { username, action: "upgrade" });
};

const unlockAutoClicker = async (username: string) => {
    return axios.put('http://localhost:3000/user', { username, action: "autoclicker" });
};

const buyWreckedCar = async (username: string, car: string) => {
    return axios.put('http://localhost:3000/user', { username, action: "buycar", car });
};

const updateSelectedCar = async (username: string, selectedCar: string) => {
    return axios.put('http://localhost:3000/user', { username, action: "selectcar", selectedCar });
};

const resetUserGame = async (username: string) => {
    return axios.post('http://localhost:3000/user/reset-game', { username });
};

const uploadProfilePicture = async (formData: FormData): Promise<{ profilePicture: string }> => {
    const response = await axios.post('http://localhost:3000/user/upload-profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data as { profilePicture: string };
};

export { loginUser, registerUser, clickAction, upgradeClickPower, unlockAutoClicker, buyWreckedCar, updateSelectedCar, saveUserState, checkUserExists, deleteUser, resetUserGame, uploadProfilePicture };
