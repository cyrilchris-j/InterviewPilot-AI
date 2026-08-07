import { dataPath } from "../utils/dataPaths.js";
import { readJson } from "../utils/readJson.js";
import type { Curriculum, CurriculumDay } from "../types/domain.js";

export class CurriculumRepository {
  private readonly curriculum: Curriculum;
  private readonly dayMap: Map<number, CurriculumDay>;

  constructor() {
    this.curriculum = readJson<Curriculum>(dataPath("curriculum.json"));
    this.dayMap = new Map(this.curriculum.days.map((day) => [day.day, day]));
  }

  getAll(): Curriculum {
    return this.curriculum;
  }

  getDays(): CurriculumDay[] {
    return this.curriculum.days;
  }

  findDay(dayNumber: number): CurriculumDay | undefined {
    return this.dayMap.get(dayNumber);
  }

  requireDay(dayNumber: number): CurriculumDay {
    const day = this.findDay(dayNumber);
    if (!day) {
      throw new Error(`Curriculum day ${dayNumber} was not found`);
    }
    return day;
  }
}
