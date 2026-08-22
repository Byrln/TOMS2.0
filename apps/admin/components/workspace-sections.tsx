import Image from "next/image";
import { Globe2, Languages, LockKeyhole, Palette, ShieldCheck, UsersRound } from "lucide-react";
import { StatusBadge } from "@toms/admin-ui";
import { getServerI18n } from "@/lib/i18n";

export async function StorefrontWorkspace() {
  const { t } = await getServerI18n();
  const themes = [
    { image: "/images/altai.png", name: "Himalaya", description: t("admin.themeAdventure") },
    { image: "/images/seoul.png", name: "Aurora", description: t("admin.themeModern") },
    { image: "/images/gobi.png", name: "Gobi", description: t("admin.themeDesert") },
  ];
  return <div className="module-grid">{themes.map((theme, index) => <article className="module-card" key={theme.name}><Image src={theme.image} width={500} height={220} alt={theme.name} /><h3>{theme.name}</h3><p>{theme.description}</p><br /><StatusBadge tone={index === 0 ? "success" : "neutral"}>{index === 0 ? t("status.PUBLISHED") : t("status.DRAFT")}</StatusBadge></article>)}</div>;
}

export async function CmsWorkspace() {
  const { t } = await getServerI18n();
  const sections = [t("cms.heroSection"), t("common.search"), t("public.featuredTours"), t("public.whyUs"), t("nav.destinations"), t("cms.testimonials"), t("public.newsletter"), t("cms.footer")];
  return <section className="panel route-board"><div><h3>{t("admin.pageStructure")}</h3>{sections.map((item, index) => <p key={item}><StatusBadge tone={index === 0 ? "warning" : "neutral"}>{index + 1}. {item}</StatusBadge></p>)}</div><article className="cms-preview"><Image src="/images/altai.png" fill sizes="600px" alt="" /><div><h3>{t("public.heroTitle")}</h3><p>{t("admin.chooseConfirmedTrip")}</p></div></article><div><h3>{t("admin.seoPublishing")}</h3><p>{t("admin.pageTitle")}</p><strong>Munkh Discovery — {t("nav.publicTours")}</strong><hr /><p>{t("language.label")}</p><strong>MN, EN</strong><hr /><p>{t("admin.release")}</p><StatusBadge tone="success">{t("admin.readyToPublish")}</StatusBadge></div></section>;
}

export async function SettingsWorkspace() {
  const { t } = await getServerI18n();
  const items = [
    [UsersRound, t("admin.company"), t("admin.companyDescription")],
    [ShieldCheck, t("admin.teamAccess"), t("admin.teamAccessDescription")],
    [Languages, t("admin.localization"), t("admin.localizationDescription")],
    [LockKeyhole, t("admin.paymentSettings"), t("admin.paymentSettingsDescription")],
    [Globe2, t("admin.domains"), t("admin.domainsDescription")],
    [Palette, t("admin.security"), t("admin.securityDescription")],
  ] as const;
  return <div className="module-grid">{items.map(([Icon, title, description]) => <article className="module-card" key={title}><Icon size={21} /><h3>{title}</h3><p>{description}</p><br /><StatusBadge tone="success">{t("admin.configured")}</StatusBadge></article>)}</div>;
}
