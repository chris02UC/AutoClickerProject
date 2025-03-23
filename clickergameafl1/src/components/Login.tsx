import React, { useState } from "react";
import { loginUser, checkUserExists } from "../apis/UserAPI";
import JunkYard from "../assets/Junk-Yard.jpg";

interface LoginProps {
    setUser: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
    const [username, setUsername] = useState<string>("");

    const handleLogin = async () => {
        if (!username.trim()) {
            alert("Please enter a username!");
            return;
        }

        try {
            const userExists = await checkUserExists(username);
            if (!userExists) {//if user does not exist
                alert("Username does not exist, please register!");
                return;
            }

            const response = await loginUser(username);
            if (response.status === 200) {
                setUser(response.data);
            } else {
                alert("Failed to log in");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    const handleRegister = async () => {
        if (!username.trim()) {
            alert("Please enter a username!");
            return;
        }

        try {
            const userExists = await checkUserExists(username);
            if (userExists) { //if user exists
                alert("Username already exists, please use another one!");
                return;
            }

            const response = await loginUser(username);
            if (response.status === 200) {
                setUser(response.data);
            } else {
                alert("Failed to register");
            }
        } catch (error) {
            console.error("Register error:", error);
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${JunkYard})` }}
        >
            <div className="bg-gray-800 bg-opacity-90 p-8 rounded-2xl shadow-md text-center text-white w-100">
                <h1 className="text-3xl font-bold mb-4">Welcome to Salvage Yard Autoclicker</h1>
                <input
                    type="text"
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-gray-500 p-2 rounded mb-4 w-full bg-gray-700 text-white"
                />
                <div className="flex space-x-4">
                    <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                        Login
                    </button>
                    <button onClick={handleRegister} className="bg-green-600 text-white px-4 py-2 rounded w-full">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
