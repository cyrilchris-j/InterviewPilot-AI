export class DifficultyAdapter {
    nextDifficulty(current, evaluation) {
        if (!evaluation)
            return current;
        if (evaluation.score >= 4.1) {
            return current === "easy" ? "medium" : "hard";
        }
        if (evaluation.score <= 2.5) {
            return current === "hard" ? "medium" : "easy";
        }
        return current;
    }
}
