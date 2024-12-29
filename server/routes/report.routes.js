import { Router } from "express";
import { uploadReport } from "../controllers/report.controllers.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";
import { analyseReport } from "../controllers/ocr-extraction.controllers.js";
import { analyzeMedicalReport, preprocessAndStoreText } from "../controllers/data-preprocessing-and-summary.controllers.js";

const reportRouter = Router();

reportRouter.route('/upload').post(authenticateUser, uploadReport)
reportRouter.route('/analyze').get(authenticateUser, analyseReport)
reportRouter.route('/clean').get(authenticateUser, preprocessAndStoreText)
reportRouter.route('/summary').get(authenticateUser, analyzeMedicalReport)

export default reportRouter