import { Router } from "express";
import { clickAction, upgradeClickPower, unlockAutoClicker, buyWreckedCar, updateSelectedCar, getAllUsers, loginOrCreateUser, updateUser, deleteUser, checkUserExists, resetUserGame, upload, updateProfilePicture } from "../controllers/userController";

const router = Router();


router.get("/check", checkUserExists);
router.post("/click", clickAction);
router.post("/upgrade", upgradeClickPower);
router.post("/unlock-autoclicker", unlockAutoClicker);
router.post("/buy-car", buyWreckedCar);
router.post("/select-car", updateSelectedCar);
router.post("/reset-game", resetUserGame);
router.get("/", getAllUsers);
router.post("/", loginOrCreateUser);
router.put("/", updateUser);
router.delete("/", deleteUser);
router.post("/upload-profile-picture", upload.single("profilePicture"), updateProfilePicture);


export default router;
