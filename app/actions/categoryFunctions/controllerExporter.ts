import getDefaultResponse from "./other/getDefaultResponse";
import weatherFunctionController from "./weather/weatherController";
import { CategoryControllers } from "@/app/types/types";
import youtubeFunctionController from "./youtube/youtubeController";
import tasksFunctionController from "./tasks/tasksController";
import calendarFunctionController from "./calendar/calendarController";

const categoryControllers: CategoryControllers = { 
    'weather': weatherFunctionController,
    'youtube': youtubeFunctionController,
    'tasks/todo': tasksFunctionController,
    'calendar': calendarFunctionController,
    'other': getDefaultResponse,
 };

export default categoryControllers;