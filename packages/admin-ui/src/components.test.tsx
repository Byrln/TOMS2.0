import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminShell, DataTable, StatusBadge } from "./index";

describe("admin UI system", () => {
  it("renders the TOMS shell and selected dense navigation state", () => {
    const html = renderToStaticMarkup(<AdminShell activePath="/bookings"><div>Booking truth</div></AdminShell>);
    expect(html).toContain("TOMS");
    expect(html).toContain("Захиалгууд");
    expect(html).toContain("aria-current=\"page\"");
    expect(html).toContain("Booking truth");
  });

  it("renders semantic status and table content", () => {
    expect(renderToStaticMarkup(<StatusBadge tone="success">Баталгаажсан</StatusBadge>)).toContain("Баталгаажсан");
    const html = renderToStaticMarkup(<DataTable columns={[{ key: "name", label: "Нэр" }]} rows={[{ id: "1", name: "Классик Европ" }]} />);
    expect(html).toContain("<table");
    expect(html).toContain("Классик Европ");
  });
});

