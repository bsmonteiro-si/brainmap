import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagInput } from "./TagInput";

describe("TagInput", () => {
  it("renders existing tags as pills", () => {
    const { container } = render(<TagInput tags={["alpha", "beta"]} onChange={() => {}} />);
    const pills = container.querySelectorAll(".tag-pill");
    expect(pills).toHaveLength(2);
    expect(pills[0].textContent).toContain("alpha");
    expect(pills[1].textContent).toContain("beta");
  });

  it("adds tag on Enter", () => {
    const onChange = vi.fn();
    render(<TagInput tags={["existing"]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("") || document.querySelector(".tag-input-field")!;
    fireEvent.change(input, { target: { value: "new-tag" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["existing", "new-tag"]);
  });

  it("adds tag on comma", () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Add tags\u2026");
    fireEvent.change(input, { target: { value: "comma-tag" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["comma-tag"]);
  });

  it("removes last tag on Backspace when input is empty", () => {
    const onChange = vi.fn();
    render(<TagInput tags={["a", "b", "c"]} onChange={onChange} />);
    const input = document.querySelector(".tag-input-field")!;
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("removes specific tag when X is clicked", () => {
    const onChange = vi.fn();
    const { container } = render(<TagInput tags={["a", "b", "c"]} onChange={onChange} />);
    const removeButtons = container.querySelectorAll(".tag-pill-remove");
    fireEvent.click(removeButtons[1]); // remove "b"
    expect(onChange).toHaveBeenCalledWith(["a", "c"]);
  });

  it("rejects duplicate tags", () => {
    const onChange = vi.fn();
    render(<TagInput tags={["existing"]} onChange={onChange} />);
    const input = document.querySelector(".tag-input-field")!;
    fireEvent.change(input, { target: { value: "existing" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects empty/whitespace tags", () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Add tags\u2026");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("focuses input after removing a tag via X button", () => {
    const { container } = render(<TagInput tags={["a", "b", "c"]} onChange={() => {}} />);
    const input = container.querySelector(".tag-input-field")!;
    const removeButtons = container.querySelectorAll(".tag-pill-remove");
    fireEvent.click(removeButtons[1]);
    expect(document.activeElement).toBe(input);
  });
});
