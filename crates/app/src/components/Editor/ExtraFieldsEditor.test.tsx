import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ExtraFieldsEditor } from "./ExtraFieldsEditor";

describe("ExtraFieldsEditor", () => {
  it("renders existing key-value pairs", () => {
    const { container } = render(
      <ExtraFieldsEditor extra={{ affiliation: "MIT", field: "CS" }} onChange={() => {}} />
    );
    const rows = container.querySelectorAll(".extra-field-row:not(.extra-field-add-row)");
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector(".extra-field-key")!.textContent).toBe("affiliation");
    expect((rows[0].querySelector(".extra-field-value") as HTMLInputElement).value).toBe("MIT");
  });

  it("adds a new field", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ExtraFieldsEditor extra={{ existing: "val" }} onChange={onChange} />
    );
    const keyInput = container.querySelector(".extra-field-new-key") as HTMLInputElement;
    const valInput = container.querySelector(".extra-field-new-value") as HTMLInputElement;
    const addBtn = container.querySelector(".extra-field-add-btn")!;

    fireEvent.change(keyInput, { target: { value: "newfield" } });
    fireEvent.change(valInput, { target: { value: "newval" } });
    fireEvent.click(addBtn);

    expect(onChange).toHaveBeenCalledWith({ existing: "val", newfield: "newval" });
  });

  it("removes a field", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ExtraFieldsEditor extra={{ a: "1", b: "2" }} onChange={onChange} />
    );
    const removeButtons = container.querySelectorAll(".extra-field-remove");
    fireEvent.click(removeButtons[0]); // remove "a"
    expect(onChange).toHaveBeenCalledWith({ b: "2" });
  });

  it("edits a field value", () => {
    const onChange = vi.fn();
    const { container } = render(
      <ExtraFieldsEditor extra={{ name: "old" }} onChange={onChange} />
    );
    const valueInput = container.querySelector(".extra-field-value") as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: "new" } });
    expect(onChange).toHaveBeenCalledWith({ name: "new" });
  });

  it("displays non-string values as JSON", () => {
    const { container } = render(
      <ExtraFieldsEditor extra={{ count: 42, nested: { a: 1 } }} onChange={() => {}} />
    );
    const inputs = container.querySelectorAll(".extra-field-value") as NodeListOf<HTMLInputElement>;
    expect(inputs[0].value).toBe("42");
    expect(inputs[1].value).toBe('{"a":1}');
  });
});
