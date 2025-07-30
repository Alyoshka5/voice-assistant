import getDefaultResponse from "./other/getDefaultResponse";
import weatherFunctionController from "./weather/weatherController";
import { CategoryControllers } from "@/app/types";
import youtubeFunctionController from "./youtube/youtubeController";

const categoryControllers: CategoryControllers = { 
    'weather': weatherFunctionController,
    'youtube': youtubeFunctionController,
    'other': getDefaultResponse
 };

export default categoryControllers;