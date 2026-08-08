import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScoreRing } from "./ScoreRing";

describe("ScoreRing", () => {
  it("renders correctly with given value", () => {
    render(<ScoreRing value={3.5} size={100} strokeWidth={10} label={<span>3.5/5</span>} />);
    expect(screen.getByText("3.5/5")).toBeInTheDocument();
  });
});
