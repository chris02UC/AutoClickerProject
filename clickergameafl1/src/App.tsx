import React, { useState } from 'react';
import Login from './components/Login';
import Game from './components/Game';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<string>('login'); //tracking page login or game
    const [user, setUser] = useState<any>(null); //logged in user saved here

    //handle login and change to the game page
    const handleLogin = (userData: any) => {
        setUser(userData);
        setCurrentPage('game');
    };

    //sign out, return to login
    const handleSignOut = () => {
        setUser(null);
        setCurrentPage('login');
    };

    return (
        <div>
            {currentPage === 'login' ? (
                <Login setUser={handleLogin} />
            ) : (
                <Game user={user} setUser={setUser} onSignOut={handleSignOut} />
            )}
        </div>
    );
};

export default App;
