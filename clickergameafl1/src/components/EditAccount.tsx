// EditAccount.tsx
import React, { useState } from "react";
import { uploadProfilePicture, deleteUser } from "../apis/UserAPI";
import blankpfp from "../assets/blankpfp.png";

interface EditAccountProps {
    user: any;
    setUser: (user: any) => void;
    onClose: () => void;
    onSignOut: () => void;
}

const EditAccount: React.FC<EditAccountProps> = ({ user, setUser, onClose, onSignOut }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };

    const handleUploadProfilePicture = async () => {
        if (!selectedFile) return;
        
        try {
            const formData = new FormData();
            formData.append("profilePicture", selectedFile);
            formData.append("username", user.username);

            const response = await uploadProfilePicture(formData);
            setUser((prev: any) => ({ ...prev, profilePicture: response.profilePicture }));
            onClose();
            alert("Profile picture updated successfully!");
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Failed to upload profile picture.");
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action is irreversible!")) {
            try {
                await deleteUser(user.username);
                onSignOut();
                alert("Account deleted successfully.");
            } catch (error) {
                console.error("Error deleting account:", error);
                alert("Failed to delete account.");
            }
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-96">
                <h2 className="text-2xl font-semibold mb-4">Edit Account</h2>
                
                <div className="mb-4">
                    <label className="block mb-2">Profile Picture:</label>
                    <img
                    src={user.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${user.profilePicture}` : blankpfp}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-4 object-cover"
                    />
                    <input type="file" onChange={handleFileChange} />
                    <button
                        onClick={handleUploadProfilePicture}
                        disabled={!selectedFile}
                        className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Update Profile Picture
                    </button>
                </div>

                <button
                    onClick={handleDeleteAccount}
                    className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded"
                >
                    Delete Account
                </button>

                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default EditAccount;
