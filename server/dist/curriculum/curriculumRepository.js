import { dataPath } from "../utils/dataPaths.js";
import { readJson } from "../utils/readJson.js";
export class CurriculumRepository {
    curriculum;
    dayMap;
    constructor() {
        this.curriculum = readJson(dataPath("curriculum.json"));
        this.dayMap = new Map(this.curriculum.days.map((day) => [day.day, day]));
    }
    getAll() {
        return this.curriculum;
    }
    getDays() {
        return this.curriculum.days;
    }
    findDay(dayNumber) {
        return this.dayMap.get(dayNumber);
    }
    requireDay(dayNumber) {
        const day = this.findDay(dayNumber);
        if (!day) {
            throw new Error(`Curriculum day ${dayNumber} was not found`);
        }
        return day;
    }
}
