import { Router } from "express";
import { uploadReport } from "../controllers/report.controllers.js";
import { authenticateUser } from "../middlewares/auth.middlewares.js";
import { cleanDataAndSummarizeReport } from "../controllers/data-preprocessing-and-summary.controllers.js";
import { analyzeMedicalReport } from '../controllers/ocr-extraction.controllers.js'

const reportRouter = Router();

reportRouter.route('/upload').post(authenticateUser, uploadReport)
reportRouter.route('/analyze').get(authenticateUser, analyzeMedicalReport)
reportRouter.route('/summarize').get(authenticateUser, cleanDataAndSummarizeReport)

export default reportRouter