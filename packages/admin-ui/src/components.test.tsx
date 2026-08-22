import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AdminShell,
  Avatar,
  AvatarFallback,
  Button,
  DataTable,
  Dialog,
  DialogTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  StatusBadge,
} from "./index";
import { LocaleProvider } from "@toms/i18n/react";

const renderLocalized = (node: React.ReactNode, locale: "mn" | "en" = "mn") => renderToStaticMarkup(<LocaleProvider initialLocale={locale}>{node}</LocaleProvider>);

describe("admin UI system", () => {
  it("renders the TOMS shell and selected dense navigation state", () => {
    const html = renderLocalized(<AdminShell activePath="/bookings"><div>Booking truth</div></AdminShell>);
    expect(html).toContain("TOMS");
    expect(html).toContain("Захиалгууд");
    expect(html).toContain("aria-current=\"page\"");
    expect(html).toContain("Booking truth");
    expect(renderLocalized(<AdminShell activePath="/bookings"><div>Booking truth</div></AdminShell>, "en")).toContain("Bookings");
  });

  it("renders the supplied collapsible workspace sidebar pattern", () => {
    const html = renderLocalized(<AdminShell activePath="/bookings"><div>Booking truth</div></AdminShell>, "en");

    expect(html).toContain("admin-sidebar__workspace-switcher");
    expect(html).toContain("admin-sidebar__group");
    expect(html).toContain("admin-shell__menu-toggle");
    expect(html).toContain('aria-current="page"');
  });

  it("keeps labelled navigation icons available when the sidebar is collapsed", () => {
    const html = renderLocalized(<AdminShell activePath="/bookings" initialSidebarOpen={false}><div>Booking truth</div></AdminShell>, "en");

    expect(html).toContain('class="admin-shell is-sidebar-collapsed"');
    expect(html).toContain('aria-label="Bookings"');
    expect(html).toContain('aria-current="page"');
  });

  it("renders semantic status and table content", () => {
    expect(renderToStaticMarkup(<StatusBadge tone="success">Баталгаажсан</StatusBadge>)).toContain("Баталгаажсан");
    const html = renderLocalized(<DataTable columns={[{ key: "name", label: "Нэр" }]} rows={[{ id: "1", name: "Классик Европ" }]} />);
    expect(html).toContain("<table");
    expect(html).toContain("Классик Европ");
  });

  it("exports accessible Base UI shadcn form and overlay primitives", () => {
    const html = renderToStaticMarkup(
      <>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="search">Search bookings</FieldLabel>
            <Input id="search" name="search" />
          </Field>
        </FieldGroup>
        <Dialog><DialogTitle>Booking detail</DialogTitle></Dialog>
        <Avatar>
          <AvatarFallback>BO</AvatarFallback>
        </Avatar>
        <Button>Save view</Button>
      </>,
    );

    expect(html).toContain('for="search"');
    expect(html).toContain("Booking detail");
    expect(html).toContain("BO");
    expect(html).toContain("Save view");
  });
});
