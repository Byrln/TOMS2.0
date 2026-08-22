import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Sheet,
  SheetTitle,
  StorefrontHeader,
  TourCard,
} from "./index";
import { LocaleProvider } from "@toms/i18n/react";

const renderLocalized = (node: React.ReactNode, locale: "mn" | "en" = "mn") => renderToStaticMarkup(<LocaleProvider initialLocale={locale}>{node}</LocaleProvider>);

describe("storefront UI system", () => {
  it("renders trusted navigation without admin concepts", () => {
    const html = renderLocalized(<StorefrontHeader />);
    expect(html).toContain("Аяллууд");
    expect(html).toContain("Миний аялал");
    expect(html).not.toContain("supplier cost");
    expect(renderLocalized(<StorefrontHeader />, "en")).toContain("My trips");
  });

  it("renders an image-led tour card with price and booking action", () => {
    const html = renderLocalized(<TourCard tour={{ slug: "classic-europe", name: "Классик Европ", summary: "Сонгодог аялал", heroImageUrl: "/images/classic-europe.png", durationDays: 11, priceMinor: 3_450_000, currency: "MNT" }} />);
    expect(html).toContain("Классик Европ");
    expect(html).toContain("3,450,000");
    expect(html).toContain("Дэлгэрэнгүй");
  });

  it("exports accessible Base UI shadcn search and mobile navigation primitives", () => {
    const html = renderToStaticMarkup(
      <>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="destination">Destination</FieldLabel>
            <Input id="destination" name="destination" />
          </Field>
        </FieldGroup>
        <Sheet><SheetTitle>Travel menu</SheetTitle></Sheet>
        <Button>Find a journey</Button>
      </>,
    );

    expect(html).toContain('for="destination"');
    expect(html).toContain("Travel menu");
    expect(html).toContain("Find a journey");
  });
});
