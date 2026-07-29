import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import playersRouter from "./players";
import monstersRouter from "./monsters";
import collectionRouter from "./collection";
import battlesRouter from "./battles";
import explorationRouter from "./exploration";
import regionsRouter from "./regions";
import inventoryRouter from "./inventory";
import leaderboardRouter from "./leaderboard";
import seedRouter from "./seed";
import shopRouter from "./shop";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(playersRouter);
router.use(monstersRouter);
router.use(collectionRouter);
router.use(battlesRouter);
router.use(explorationRouter);
router.use(regionsRouter);
router.use(inventoryRouter);
router.use(leaderboardRouter);
router.use(seedRouter);
router.use(shopRouter);

export default router;
