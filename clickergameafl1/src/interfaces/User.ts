export interface User {
    id: number;
    username: string;
    points: number;
    clickPower: number;
    unlockedAutoClicker: boolean;
    ownedCars: string[];
    selectedCar: string;
}
