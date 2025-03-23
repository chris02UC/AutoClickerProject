import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient()

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
}

export const checkUserExists = async (req: Request, res: Response) => {
    const { username } = req.query; //ambil username dari query params
    
    try {
        const user = await prisma.user.findUnique({ where: { username: String(username) } });
        res.json({ exists: !!user }); //true if user exist, false if not
    } catch (error) {
        console.error("Error checking user existence:", error);
        res.status(500).json({ message: "Error checking user existence" });
    }
};

export const loginOrCreateUser = async (req: Request, res: Response) => {
    const { username } = req.body;

    try {
        let user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) { //if user not exist, make new
            user = await prisma.user.create({
                data: {
                    username,
                    points: 0,
                    clickPower: 1,
                    multiplierCost: 10,
                    unlockedAutoClicker: false,
                    ownedCars: ["default"],
                    selectedCar: "default"
                }
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Error in loginOrCreateUser:", error);
        res.status(500).json({ message: "Error logging in or creating user" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { username, points, clickPower, unlockedAutoClicker, selectedCar, ownedCars, gameEnded, multiplierCost } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const updatedUser = await prisma.user.update({
            where: { username },
            data: {
                points: points ?? user.points,
                clickPower: clickPower ?? user.clickPower,
                unlockedAutoClicker: unlockedAutoClicker ?? user.unlockedAutoClicker,
                selectedCar: selectedCar ?? user.selectedCar,
                ownedCars: ownedCars ?? user.ownedCars,
                gameEnded: gameEnded ?? user.gameEnded,
                multiplierCost: multiplierCost ?? user.multiplierCost
                //take new value if not null (points), if null take exisitng value (user.points)
                //pakai if not all fields are updated
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { username } = req.query as { username: string }; //ambil dari query

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await prisma.user.delete({ where: { username } });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user" });
    }
};

export const clickAction = async (req: Request, res: Response) => {
    const { username } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ message: "User not found" })

    const updatedUser = await prisma.user.update({
        where: { username },
        data: { points: user.points + user.clickPower },
        //calculates point. misal: 10 points and 2 clickpower, 1 click means 10+ 2 jadi 12 pts
    })

    res.json(updatedUser)
}

export const upgradeClickPower = async (req: Request, res: Response) => {
    const { username } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    //use multiplier cost that is saved
    const { multiplierCost } = user;

    //check enough points or not
    if (user.points < multiplierCost) {
        return res.status(400).json({ message: `Not enough points for upgrade. Current upgrade cost is ${multiplierCost} points.` });
    }

    //doubles multiplier cost after upgrade
    const newMultiplierCost = multiplierCost * 2;

    const updatedUser = await prisma.user.update({
        where: { username },
        data: {
            clickPower: user.clickPower + 1,       //clickpower added
            points: user.points - multiplierCost,  //deduct points with current multplier cost
            multiplierCost: newMultiplierCost      //multiplier cost updated
        }
    });

    res.json(updatedUser);
};

export const unlockAutoClicker = async (req: Request, res: Response) => {
    const { username } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ message: "User not found" })

    if (user.unlockedAutoClicker) return res.status(400).json({ message: "Auto-clicker already unlocked" })
    if (user.points < 50) return res.status(400).json({ message: "Not enough points for auto-clicker" })
        //also set autoclicker price here
    const updatedUser = await prisma.user.update({
        where: { username },
        data: { unlockedAutoClicker: true, points: user.points - 50 },
        //autoclicker unlocked
    })

    res.json(updatedUser)
}

export const buyWreckedCar = async (req: Request, res: Response) => {
    const { username, car } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ message: "User not found" })

    if (user.ownedCars.includes(car)) return res.status(400).json({ message: "Car already purchased" })
    if (user.points < 10) return res.status(400).json({ message: "Not enough points to purchase car" })
        //set harga mobil here
    
    const updatedUser = await prisma.user.update({
        where: { username },
        data: { ownedCars: [...user.ownedCars, car], points: user.points - 10 },
        //also set harga mobil here
    })

    res.json(updatedUser)
}

//user changes the car image (this is saved)
export const updateSelectedCar = async (req: Request, res: Response) => {
    const { username, selectedCar } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(404).json({ message: "User not found" })

    if (!user.ownedCars.includes(selectedCar)) return res.status(400).json({ message: "Car not owned" })

    const updatedUser = await prisma.user.update({
        where: { username },
        data: { selectedCar },
    })

    res.json(updatedUser)
}

export const resetUserGame = async (req: Request, res: Response) => {
    const { username } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetData = {
            points: 0,
            clickPower: 1,
            unlockedAutoClicker: false,
            ownedCars: ["default"],
            selectedCar: "default",
            gameEnded: false,
            multiplierCost: 10 
        };

        const updatedUser = await prisma.user.update({
            where: { username },
            data: resetData,
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Error resetting user game:", error);
        res.status(500).json({ message: "Error resetting game" });
    }
};

//configure Multer for uploading to 'uploads/profile-pictures' folder
const storage = multer.diskStorage({
    destination: "uploads/profile-pictures",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
        //upload file given unique name based on time uploaded
    }
});

const upload = multer({ storage });

//controller for updating profile picture
export const updateProfilePicture = async (req: Request, res: Response) => {
    const { username } = req.body;
    const profilePicture = req.file?.filename;

    if (!profilePicture) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const user = await prisma.user.update({
            where: { username },
            data: { profilePicture }
        });

        res.json({ message: "Profile picture updated successfully", profilePicture: user.profilePicture });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Error updating profile picture" });
    }
};


export { upload };
