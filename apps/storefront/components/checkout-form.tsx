"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { ShieldCheck } from "lucide-react";
import { formatCurrencyMinor } from "@toms/config";
import type { Departure, Tour } from "@/lib/api";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FormValue = {
  fullName: string;
  email: string;
  companionName: string;
  nationality: string;
  termsAccepted: boolean;
};

async function checkout(input: { values: FormValue; departure: Departure }) {
  const holdResponse = await fetch(`${apiUrl}/api/v1/booking-holds`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      departureId: input.departure.id,
      partySize: 2,
      idempotencyKey: `hold-${crypto.randomUUID()}`,
    }),
  });
  if (!holdResponse.ok)
    throw new Error(
      ((await holdResponse.json()) as { error?: { message?: string } }).error
        ?.message ?? "Availability hold failed",
    );
  const hold = (await holdResponse.json()) as { id: string };
  const checkoutResponse = await fetch(`${apiUrl}/api/v1/checkout/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
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
      paymentMethod: "DEMO",
      termsAccepted: true,
      idempotencyKey: `checkout-${crypto.randomUUID()}`,
    }),
  });
  if (!checkoutResponse.ok)
    throw new Error(
      ((await checkoutResponse.json()) as { error?: { message?: string } })
        .error?.message ?? "Checkout failed",
    );
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
  const mutation = useMutation({
    mutationFn: checkout,
    onSuccess: (booking) =>
      router.push(
        `/booking/confirmation/${booking.id}?email=${encodeURIComponent(booking.organizerEmail)}`,
      ),
  });
  const form = useForm({
    defaultValues: {
      fullName: "Bat-Orgil Munkhbat",
      email: "bat@example.com",
      companionName: "Enkhjin Munkhbat",
      nationality: "MN",
      termsAccepted: false,
    } as FormValue,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ values: value, departure });
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
        <h1>Захиалгаа баталгаажуулах</h1>
        <p>
          Төлөгч болон аялагч тусдаа байх боломжтой. Энэхүү demo урсгал картын
          мэдээлэл хадгалахгүй.
        </p>
        <div className="form-grid">
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? "Бүтэн нэр оруулна уу" : undefined,
            }}
          >
            {(field) => (
              <label className="field">
                <span>Төлөгчийн нэр</span>
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
                /\S+@\S+\.\S+/.test(value) ? undefined : "Имэйл буруу байна",
            }}
          >
            {(field) => (
              <label className="field">
                <span>Имэйл</span>
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
                value.trim().length < 2 ? "Хоёр дахь аялагчийн нэр" : undefined,
            }}
          >
            {(field) => (
              <label className="field">
                <span>2-р аялагч</span>
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
                <span>Иргэншил</span>
                <select
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                >
                  <option value="MN">Монгол</option>
                  <option value="US">United States</option>
                  <option value="KR">Korea</option>
                </select>
              </label>
            )}
          </form.Field>
        </div>
        <form.Field
          name="termsAccepted"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : "Нөхцөлийг зөвшөөрнө үү",
          }}
        >
          {(field) => (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              <span>
                Захиалгын нөхцөл, цуцлалтын бодлого, хувийн мэдээллийн журмыг
                зөвшөөрч байна.
              </span>
            </label>
          )}
        </form.Field>
        {mutation.error ? (
          <div className="checkout-error" role="alert">
            {mutation.error.message}
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
                ? "Баталгаажуулж байна..."
                : `${formatCurrencyMinor(total, departure.currency)} төлөх`}
            </button>
          )}
        </form.Subscribe>
        <small>
          <ShieldCheck size={13} /> Inventory 15 минут atomically hold хийгдэж,
          demo payment амжилттай баталгаажна.
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
            <span>Огноо</span>
            <strong>
              {departure.startsOn} → {departure.endsOn}
            </strong>
          </div>
          <div className="summary-row">
            <span>Аялагч</span>
            <strong>2</strong>
          </div>
          <div className="summary-row">
            <span>Нэг хүний үнэ</span>
            <strong>
              {formatCurrencyMinor(departure.priceMinor, departure.currency)}
            </strong>
          </div>
          <div className="summary-row total">
            <span>Нийт</span>
            <strong>{formatCurrencyMinor(total, departure.currency)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}
