export type ModuleDefinition = { title: string; description: string; resource?: string; action: string; type: "dashboard" | "table" | "operations" | "cms" | "storefront" | "promotions" | "reports" | "settings" };

export const moduleDefinitions: Record<string, ModuleDefinition> = {
  "/": { title: "Хяналтын самбар", description: "Өнөөдрийн ажил, борлуулалт, багтаамж ба анхаарах зүйлс.", action: "Экспорт", type: "dashboard" },
  "/tours": { title: "Аяллууд", description: "Reusable бүтээгдэхүүн, контент, үнэ ба нийтлэх төлөв.", resource: "tours", action: "Шинэ аялал үүсгэх", type: "table" },
  "/departures": { title: "Хуваарьт гаралтууд", description: "Бодит огноо, багтаамж, үнэ, хөтөлбөр ба үйл ажиллагааны үнэн.", resource: "departures", action: "Шинэ хуваарь нэмэх", type: "operations" },
  "/bookings": { title: "Захиалгууд", description: "Статус, төлбөр, аялагч, суваг ба хурдан ажиллагаа.", resource: "bookings", action: "Шинэ захиалга", type: "table" },
  "/travelers": { title: "Аялагчдын CRM", description: "Аяллын түүх, шаардлага, баримт, харилцаа ба профайл.", resource: "travelers", action: "Аялагч нэмэх", type: "table" },
  "/customers": { title: "Харилцагчдын CRM", description: "Худалдан авагч, байгууллага, төлөгч, lifecycle ба үнэ цэнэ.", resource: "customers", action: "Харилцагч нэмэх", type: "table" },
  "/conversations": { title: "Харилцааны төв", description: "Имэйл, мессеж, үйлчилгээний хүсэлт ба багийн хариулт.", resource: "conversations", action: "Шинэ харилцаа", type: "operations" },
  "/operations": { title: "Үйл ажиллагааны хяналт", description: "Rooming, transport, hotel, guide, supplier баталгаажуулалт.", resource: "operations", action: "Үйл ажиллагаа шинэчлэх", type: "operations" },
  "/manifest": { title: "Гарах аяллын бүртгэл", description: "Пассажир, баримт, хүсэлт, pickup ба checklist.", resource: "travelers", action: "PDF Manifest", type: "table" },
  "/payments": { title: "Төлбөрүүд", description: "Гүйлгээ, хэсэгчлэн төлөлт, валют, төлөв ба reconciliation.", resource: "payments", action: "Шинэ төлбөр", type: "table" },
  "/invoices": { title: "Нэхэмжлэл ба баримтууд", description: "Invoice, receipt, төлөгдсөн дүн ба төлбөрийн тойм.", resource: "invoices", action: "Шинэ нэхэмжлэл", type: "table" },
  "/documents": { title: "Баримт бичиг", description: "Voucher, баталгаажуулалт, тасалбар ба хувийн файлууд.", resource: "documents", action: "Шинэ баримт", type: "table" },
  "/storefront": { title: "Storefront тойм", description: "Нийтэлсэн сайт, traffic, conversion, загвар ба release.", action: "Шинэ release", type: "storefront" },
  "/cms": { title: "CMS контент засварлагч", description: "Homepage section, SEO, navigation ба нийтлэх урсгал.", action: "Publish now", type: "cms" },
  "/promotions": { title: "Promotions Engine", description: "Coupon, early bird, bundle, add-on, member pricing ба attribution.", resource: "promotions", action: "Шинэ урамшуулал", type: "promotions" },
  "/reports": { title: "Тайлан", description: "Борлуулалт, departures, payments, customer ба promotion readout.", action: "Тайлан татах", type: "reports" },
  "/settings": { title: "Тохиргоо", description: "Компани, баг, эрх, localization, payment, domain ба security.", action: "Хадгалах", type: "settings" }
};

