import React, { useEffect, useRef, useState } from "react";
import { clickAction, upgradeClickPower, unlockAutoClicker, buyWreckedCar, updateSelectedCar, saveUserState, deleteUser, resetUserGame } from "../apis/UserAPI";
import blankpfp from "../assets/blankpfp.png"; 
import Car from "../assets/cardestroyed.png";
import WreckedAlfa from "../assets/wreckedalfa.png";
import CamryCrash from "../assets/camrycrash.png";
import Gear from "../assets/gear.png";
import JunkYard from "../assets/Junk-Yard.jpg";
import NewCar from "../assets/newcar.png";
import EditAccountModal from "./EditAccount";

interface GameProps {
    user: any;
    setUser: (user: any) => void;
    onSignOut: () => void;
}

const Game: React.FC<GameProps> = ({ user, setUser, onSignOut }) => {
    const [points, setPoints] = useState<number>(user.points || 0);
    const [multiplier, setMultiplier] = useState<number>(user.clickPower || 1);
    const [autoClicker, setAutoClicker] = useState<boolean>(user.unlockedAutoClicker || false);
    const [autoClickerOn, setAutoClickerOn] = useState<boolean>(false);
    const [multiplierCost, setMultiplierCost] = useState<number>(user.multiplierCost || 10);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [gameEnded, setGameEnded] = useState<boolean>(user.gameEnded || false);
    const [carType, setCarType] = useState<string>(user.selectedCar || "default");
    const [ownedCars, setOwnedCars] = useState<Array<string>>(user.ownedCars || ["default"]);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const carRef = useRef<HTMLImageElement>(null);

    const handleSaveAndSignOut = async () => {
        const gameState = {
            points,
            clickPower: multiplier,
            unlockedAutoClicker: autoClicker,
            selectedCar: carType,
            ownedCars,
            gameEnded,
            multiplierCost, 
        };
    
        try {
            await saveUserState(user.username, gameState);
            onSignOut();
        } catch (error) {
            console.error("Error saving and signing out:", error);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action is irreversible!')) {
            try {
                await deleteUser(user.username);
                onSignOut(); //sign out after deleting the account
                alert('Account deleted successfully.');
            } catch (error) {
                console.error("Error deleting account:", error);
                alert('Failed to delete account.');
            }
        }
    };

    const handleClick = async () => {
        if (!carRef.current || gameEnded) return;

        const rect = carRef.current.getBoundingClientRect();
        const x = Math.random() * (rect.width - 40) + rect.left;
        const y = Math.random() * (rect.height - 40) + rect.top;

        setPoints((prev) => prev + multiplier);

        try {
            const response = await clickAction(user.username);
            setUser(response.data);
        } catch (error) {
            console.error("Error clicking:", error);
        }

        spawnParticle(x, y);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 100);
    };

    const spawnParticle = (x: number, y: number) => {
        const newParticle = { id: Date.now(), x, y };
        setParticles((prev) => [...prev, newParticle]);
        setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== newParticle.id)), 1000);
    };

    const handleUpgradeMultiplier = async () => {
        if (points < multiplierCost) return;
    
        setPoints((prev) => prev - multiplierCost);
        setMultiplier((prev) => prev + 1);
        setMultiplierCost((prev) => prev * 2);
    
        try {
            const response = await upgradeClickPower(user.username);
            setUser(response.data);
        } catch (error) {
            console.error("Error upgrading multiplier:", error);
        }
    };

    const handleAutoClickerPurchase = async () => {
        if (points < 50 || autoClicker) return;

        setPoints((prev) => prev - 50);
        setAutoClicker(true);

        try {
            const response = await unlockAutoClicker(user.username);
            setUser(response.data);
        } catch (error) {
            console.error("Error unlocking auto-clicker:", error);
        }
    };

    const handleBuyWreckedCar = async (car: string) => {
        if (points < 10 || ownedCars.includes(car)) return;

        setPoints((prev) => prev - 10);
        setOwnedCars((prev) => [...prev, car]);

        try {
            const response = await buyWreckedCar(user.username, car);
            setUser(response.data);
        } catch (error) {
            console.error("Error buying wrecked car:", error);
        }
    };

    const handleSelectCar = async (car: string) => {
        setCarType(car);

        try {
            const response = await updateSelectedCar(user.username, car);
            setUser(response.data);
        } catch (error) {
            console.error("Error selecting car:", error);
        }
    };


    const resetGame = async () => {
        const resetState = {
            points: 0,
            clickPower: 1,
            unlockedAutoClicker: false,
            ownedCars: ["default"],
            selectedCar: "default",
            gameEnded: false,
            multiplierCost: 10,
        };

        try {
            await saveUserState(user.username, resetState); //save the reset state
            setUser((prevUser: any) => ({ ...prevUser, ...resetState })); 
            setPoints(0);
            setMultiplier(1);
            setMultiplierCost(10); 
            setAutoClicker(false);
            setOwnedCars(["default"]);
            setCarType("default");
            setGameEnded(false); // Close the game end modal
        } catch (error) {
            console.error("Error resetting game:", error);
            alert("Failed to reset game.");
        }
    };

    const buildNewCar = () => {
        if (points >= 1000000) {
            setPoints((prev) => prev - 1000000);
            setGameEnded(true);
        }
    };

    

    useEffect(() => {
        if (autoClicker && autoClickerOn) {
            const interval = setInterval(() => handleClick(), 1000);
            return () => clearInterval(interval);
        }
    }, [autoClicker, autoClickerOn, handleClick]);

    return (
        <div className="min-h-screen flex relative">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-800 text-white p-6">
            <div className="flex items-center mb-4">
            <img
                    src={user.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${user.profilePicture}` : blankpfp}        alt="User Profile"
            className="w-16 h-16 rounded-full mr-4 object-cover"
            />
                <h1 className="text-3xl font-bold">Hello, {user.username}!</h1>
            </div>
                <h2 className="text-xl mb-6">Click the Car to Salvage!</h2>
                <p className="mb-4 text-lg">Gears Salvaged: {points}</p>
                <p className="mb-6 text-lg">Multiplier: {multiplier}</p>

                <button onClick={handleUpgradeMultiplier} className={`bg-green-500 w-full px-6 py-2 rounded font-semibold mb-4 ${points < multiplierCost ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={points < multiplierCost}>
                    Upgrade Multiplier (Cost: {multiplierCost} Points)
                </button>

                <button onClick={handleAutoClickerPurchase} className={`bg-red-500 w-full px-6 py-2 rounded font-semibold mb-4 ${points < 50 || autoClicker ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={points < 50 || autoClicker}>
                    Buy Auto Clicker (Cost: 50 Points)
                </button>
                <button onClick={() => handleBuyWreckedCar("alfa")} className={`bg-yellow-500 w-full px-6 py-2 rounded font-semibold mb-4 ${points < 10 || ownedCars.includes("alfa") ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={points < 10 || ownedCars.includes("alfa")}>
                    Buy Wreck 1 (Cost: 10 Points)
                </button>
                <button onClick={() => handleBuyWreckedCar("camry")} className={`bg-yellow-500 w-full px-6 py-2 rounded font-semibold mb-4 ${points < 10 || ownedCars.includes("camry") ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={points < 10 || ownedCars.includes("camry")}>
                    Buy Wreck 2 (Cost: 10 Points)
                </button>

                <button onClick={buildNewCar} className={`bg-blue-500 w-full px-6 py-2 rounded font-semibold mb-4 ${points < 1000000 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={points < 1000000 || gameEnded}>
                    Build New Car (Cost: 1000000 Points)
                </button>

                <select className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 focus:bg-gray-500" value={carType} onChange={(e) => handleSelectCar(e.target.value)}>
                    <option value="default">Default Car</option>
                    {ownedCars.includes("alfa") && <option value="alfa">Wreck 1</option>}
                    {ownedCars.includes("camry") && <option value="camry">Wreck 2</option>}
                </select>

                {/* Toggle for AutoClicker */}
                {autoClicker && (
                    <div className="mt-4 flex items-center">
                        <label htmlFor="autoClickerToggle" className="text-lg font-semibold mr-2">Auto-Clicker</label>
                        <input 
                            id="autoClickerToggle"
                            type="checkbox"
                            checked={autoClickerOn}
                            onChange={() => setAutoClickerOn(!autoClickerOn)}
                            className="transform scale-125"
                        />
                    </div>
                )}

                <button onClick={handleSaveAndSignOut} className="bg-purple-500 w-full px-4 py-2 rounded mt-4">
                    Save and Sign Out
                </button>
                <button onClick={() => setIsEditModalOpen(true)} className="bg-blue-600 w-full text-white px-4 py-2 rounded mt-4">
                        Edit Account
                    </button>
            </div>

            {/* Clicker Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                <div className={`absolute inset-0 bg-center bg-cover ${gameEnded ? 'blur-md' : ''}`} style={{ backgroundImage: `url(${JunkYard})`, backgroundSize: 'cover', width: '100%', height: '100%', zIndex: -1 }} />
                {!gameEnded && (
                    <img ref={carRef} src={carType === "alfa" ? WreckedAlfa : carType === "camry" ? CamryCrash : Car} alt="Wrecked Car" className={`cursor-pointer ${isAnimating ? 'pop' : ''}`} style={{ width: '500px', height: 'auto', zIndex: 1 }} onClick={handleClick} />
                )}


           {/* Edit Account Modal */}
           {isEditModalOpen && (
                <EditAccountModal
                    user={user}
                    setUser={setUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onSignOut={onSignOut}
                />
            )}

                {/* Render particles */}
                {!gameEnded && particles.map((particle) => (
                    <img 
                        key={particle.id} 
                        src={Gear} 
                        alt="Gear Particle" 
                        className="absolute pop"
                        style={{
                            top: particle.y,
                            left: particle.x,
                            width: '40px',
                            height: '40px',
                            animation: 'bop 1s ease-out forwards',
                            position: 'fixed',
                            zIndex: 2
                        }}
                    />
                ))}

            {/* Game End Display */}
            {gameEnded && (
    <   div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
        
        {/* New Car Image at the top */}
        <div className="mb-6">
            <img src={NewCar} alt="New Car" className="max-w-xl max-h-full object-contain" />
        </div>
        
        {/* Game End Modal Box below the car image */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white w-96 text-center">
            <h2 className="text-3xl font-semibold mb-6">Congratulations! You've built a new car!</h2>
            
            {/* Reset Game Button */}
            <button
                onClick={resetGame}
                className="mb-4 w-full bg-green-500 text-white px-4 py-2 rounded"
            >
                Reset Game
            </button>

            {/* Delete Account Button */}
            <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 text-white px-4 py-2 rounded"
            >
                Delete Account
            </button>
            </div>
            </div>
            )}
            </div>

            {/* Inline CSS Animations */}
            <style>
                {`
                  @keyframes bop {
                    0% { transform: translate(0, 0) scale(1); opacity: 1; }
                    50% { transform: translate(-30px, -50px) scale(1.2); opacity: 0.7; }
                    100% { transform: translate(-60px, -100px) scale(0.8); opacity: 0; }
                  }
                  @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                  }
                  .pop { animation: pop 0.1s ease-in-out; }
                  .blur-md { filter: blur(10px); }
                `}
            </style>
        </div>
    );
};

export default Game;
