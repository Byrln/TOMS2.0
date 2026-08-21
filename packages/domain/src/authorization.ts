export type StaffRole = "OWNER" | "ADMIN" | "SALES" | "OPERATIONS" | "FINANCE" | "CONTENT" | "GUIDE" | "VIEWER";
export type Permission =
  | "tour:write"
  | "departure:operate"
  | "booking:write"
  | "payment:read"
  | "payment:write"
  | "passport:read"
  | "storefront:publish"
  | "report:read"
  | "team:manage";

const allPermissions: ReadonlyArray<Permission> = ["tour:write", "departure:operate", "booking:write", "payment:read", "payment:write", "passport:read", "storefront:publish", "report:read", "team:manage"];
const permissions: Readonly<Record<StaffRole, ReadonlySet<Permission>>> = {
  OWNER: new Set(allPermissions),
  ADMIN: new Set(allPermissions),
  SALES: new Set(["tour:write", "booking:write", "report:read"]),
  OPERATIONS: new Set(["tour:write", "departure:operate", "booking:write", "passport:read", "report:read"]),
  FINANCE: new Set(["payment:read", "payment:write", "report:read"]),
  CONTENT: new Set(["tour:write", "storefront:publish", "report:read"]),
  GUIDE: new Set(["departure:operate"]),
  VIEWER: new Set(["report:read"])
};

export function can(role: StaffRole, permission: Permission): boolean {
  return permissions[role].has(permission);
}

export interface ItineraryEventInput {
  id: string;
  title: string;
  startsAt: string;
  visibility: "STAFF" | "TRAVELER";
  internalNote?: string;
  location?: string;
  details?: string;
}

export interface TravelerItineraryEvent {
  id: string;
  title: string;
  startsAt: string;
  location?: string;
  details?: string;
}

export function projectTravelerItinerary(events: ReadonlyArray<ItineraryEventInput>): TravelerItineraryEvent[] {
  return events
    .filter((event) => event.visibility === "TRAVELER")
    .map(({ id, title, startsAt, location, details }) => ({
      id,
      title,
      startsAt,
      ...(location === undefined ? {} : { location }),
      ...(details === undefined ? {} : { details })
    }));
}

