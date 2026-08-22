"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { ShieldCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import { intlLocale } from "@toms/i18n";
import { useLocale } from "@toms/i18n/react";
import type { Departure, Tour } from "@/lib/api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FormValue = {
  fullName: string;
  email: string;
  companionName: string;
  nationality: string;
  termsAccepted: boolean;
};

async function checkout(input: { values: FormValue; departure: Departure; locale: "mn" | "en" }) {
  const storefrontHost = window.location.hostname;
  const holdKey = `hold-${crypto.randomUUID()}`;
  const holdResponse = await fetch(`${apiUrl}/api/v1/booking-holds`, {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": holdKey, "x-toms-storefront-host": storefrontHost, "x-toms-locale": input.locale },
    body: JSON.stringify({
      departureId: input.departure.id,
      partySize: 2,
    }),
  });
  if (!holdResponse.ok)
    throw new Error("HOLD_FAILED");
  const hold = (await holdResponse.json()) as { id: string };
  const checkoutKey = `checkout-${crypto.randomUUID()}`;
  const checkoutResponse = await fetch(`${apiUrl}/api/v1/checkout/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json", "idempotency-key": checkoutKey, "x-toms-storefront-host": storefrontHost, "x-toms-locale": input.locale },
    body: JSON.stringify({
      holdId: hold.id,
      payer: { fullName: input.values.fullName, email: input.values.email },
      travelers: [
        {
          fullName: input.values.fullName,
          nationality: input.values.nationality,
        },
        {
          fullName: input.values.companionName,
          nationality: input.values.nationality,
        },
      ],
      termsAccepted: input.values.termsAccepted,
    }),
  });
  if (!checkoutResponse.ok)
    throw new Error("CHECKOUT_FAILED");
  return checkoutResponse.json() as Promise<{
    id: string;
    organizerEmail: string;
  }>;
}

export function CheckoutForm({
  tour,
  departure,
}: {
  tour: Tour;
  departure: Departure;
}) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const currencyLocale = intlLocale(locale);
  const regions = new Intl.DisplayNames([currencyLocale], { type: "region" });
  const mutation = useMutation({
    mutationFn: checkout,
    onSuccess: (booking) => router.push(`/login?email=${encodeURIComponent(booking.organizerEmail)}&booking=${booking.id}`),
  });
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      companionName: "",
      nationality: "MN",
      termsAccepted: false,
    } as FormValue,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ values: value, departure, locale });
    },
  });
  const total = departure.priceMinor * 2;
  return (
    <div className="checkout-layout">
      <form
        className="checkout-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <h1>{t("checkout.reviewTitle")}</h1>
        <p>{t("checkout.reviewDescription")}</p>
        <div className="form-grid">
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? t("checkout.fullNameValidation") : undefined,
            }}
          >
            {(field) => (
              <label className="field">
                <span>{t("checkout.payerName")}</span>
                <input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {field.state.meta.errors[0] ? (
                  <small>{String(field.state.meta.errors[0])}</small>
                ) : null}
              </label>
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                /\S+@\S+\.\S+/.test(value) ? undefined : t("validation.email"),
            }}
          >
            {(field) => (
              <label className="field">
                <span>{t("auth.email")}</span>
                <input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {field.state.meta.errors[0] ? (
                  <small>{String(field.state.meta.errors[0])}</small>
                ) : null}
              </label>
            )}
          </form.Field>
          <form.Field
            name="companionName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? t("checkout.secondTravelerValidation") : undefined,
            }}
          >
            {(field) => (
              <label className="field">
                <span>{t("checkout.secondTraveler")}</span>
                <input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                {field.state.meta.errors[0] ? (
                  <small>{String(field.state.meta.errors[0])}</small>
                ) : null}
              </label>
            )}
          </form.Field>
          <form.Field name="nationality">
            {(field) => (
              <label className="field">
                <span>{t("checkout.nationality")}</span>
                <select
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                >
                  <option value="MN">{regions.of("MN")}</option>
                  <option value="US">{regions.of("US")}</option>
                  <option value="KR">{regions.of("KR")}</option>
                </select>
              </label>
            )}
          </form.Field>
        </div>
        <form.Field
          name="termsAccepted"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : t("checkout.acceptTermsValidation"),
          }}
        >
          {(field) => (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              <span>{t("checkout.termsLong")}</span>
            </label>
          )}
        </form.Field>
        {mutation.error ? (
          <div className="checkout-error" role="alert">
            {mutation.error.message === "HOLD_FAILED" ? t("checkout.holdFailed") : t("checkout.checkoutFailed")}
          </div>
        ) : null}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              className="checkout-submit"
              type="submit"
              disabled={!canSubmit || isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending
                ? t("checkout.processing")
                : t("checkout.reserveAmount", { amount: formatCurrencyMinor(total, departure.currency, currencyLocale) })}
            </button>
          )}
        </form.Subscribe>
        <small>
          <ShieldCheck size={13} /> {t("checkout.inventoryNotice")}
        </small>
      </form>
      <aside className="checkout-summary">
        <Image
          src={tour.heroImageUrl}
          alt={tour.name}
          width={600}
          height={340}
          loading="eager"
          fetchPriority="high"
        />
        <div className="checkout-summary__body">
          <h2>{tour.name}</h2>
          <div className="summary-row">
            <span>{t("checkout.date")}</span>
            <strong>
              {departure.startsOn} → {departure.endsOn}
            </strong>
          </div>
          <div className="summary-row">
            <span>{t("checkout.traveler")}</span>
            <strong>2</strong>
          </div>
          <div className="summary-row">
            <span>{t("checkout.unitPrice")}</span>
            <strong>
              {formatCurrencyMinor(departure.priceMinor, departure.currency, currencyLocale)}
            </strong>
          </div>
          <div className="summary-row total">
            <span>{t("checkout.total")}</span>
            <strong>{formatCurrencyMinor(total, departure.currency, currencyLocale)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
