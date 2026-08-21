export const supportedLocales=["mn-MN","en-US"] as const;
export type SupportedLocale=typeof supportedLocales[number];

export function formatDepartureRange(startsOn:string,endsOn:string,locale:SupportedLocale,timeZone:string):string{
  const formatter=new Intl.DateTimeFormat(locale,{year:"numeric",month:"short",day:"numeric",timeZone});
  return `${formatter.format(new Date(`${startsOn}T12:00:00Z`))} – ${formatter.format(new Date(`${endsOn}T12:00:00Z`))}`;
}
export function tenantDateTime(value:string|Date,locale:SupportedLocale,timeZone:string):string{return new Intl.DateTimeFormat(locale,{dateStyle:"medium",timeStyle:"short",timeZone}).format(new Date(value))}

