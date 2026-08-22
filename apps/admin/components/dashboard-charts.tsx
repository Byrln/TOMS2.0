"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@toms/admin-ui";

export function BookingValueChart({ data }: { data: Array<{ period: string; bookingValueMinor: number; bookingCount: number }> }) {
  return <ChartContainer className="dashboard-chart" config={{ bookingValueMinor: { label: "Booking value", color: "var(--chart-1)" }, bookingCount: { label: "Bookings", color: "var(--chart-2)" } }}><BarChart data={data} accessibilityLayer margin={{ left: 8, right: 8 }}><CartesianGrid vertical={false} /><XAxis dataKey="period" tickLine={false} axisLine={false} tickFormatter={(value: string) => value.slice(5)} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="bookingValueMinor" fill="var(--color-bookingValueMinor)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer>;
}

export function DepartureHealthChart({ data }: { data: { ready: number; attention: number; atRisk: number } }) {
  const rows = [{ name: "Ready", value: data.ready, color: "var(--chart-2)" }, { name: "Attention", value: data.attention, color: "var(--chart-4)" }, { name: "At risk", value: data.atRisk, color: "var(--destructive)" }];
  return <ChartContainer className="health-chart" config={{ value: { label: "Departures" } }}><PieChart accessibilityLayer><ChartTooltip content={<ChartTooltipContent nameKey="name" />} /><Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={3}>{rows.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ChartContainer>;
}
