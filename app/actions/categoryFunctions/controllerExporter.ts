import getDefaultResponse from "./other/getDefaultResponse";
import weatherFunctionController from "./weather/weatherController";
import { CategoryControllers } from "@/app/types";

const categoryControllers: CategoryControllers = { 
    'weather': weatherFunctionController,
    'other': getDefaultResponse
 };

export default categoryControllers;