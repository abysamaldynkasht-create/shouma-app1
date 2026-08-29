import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle, HeadingLevel } from "docx";
import * as fs from "fs";
import * as path from "path";

async function generateDocx() {
  const accountsData = [
    {
      dept: "الإدارة العليا والنظام العام (Master Admin)",
      portal: "لوحة التحكم الرئيسية والمسؤول الأعلى",
      route: "/admin-1",
      name: "المدير العام للمنصة (المسؤول الأعلى)",
      email: "admin@shouma.om",
      password: "admin123 / shouma2026",
      status: "نشط (صلاحية كاملة)"
    },
    {
      dept: "الإدارة المالية والتدقيق (Finance)",
      portal: "لوحة الإدارة المالية العامة والتدقيق الأرباح",
      route: "/finance-admin",
      name: "سالم العبري - المحاسب الرئيسي",
      email: "finance1@shouma.com",
      password: "finance2026",
      status: "نشط"
    },
    {
      dept: "الإدارة المالية والتدقيق (Finance)",
      portal: "لوحة الإدارة المالية العامة والتدقيق الأرباح",
      route: "/finance-admin",
      name: "بدرية الهنائية - مديرة التدقيق والأرباح",
      email: "finance2@shouma.com",
      password: "finance2026",
      status: "نشط"
    },
    {
      dept: "الإدارة المالية والتدقيق (Finance)",
      portal: "لوحة الإدارة المالية العامة والتدقيق الأرباح",
      route: "/finance-admin",
      name: "المحاسب المالي العام",
      email: "finance@shouma.com",
      password: "finance2026",
      status: "نشط"
    },
    {
      dept: "الفنادق والمنتجعات (Hotels & Resorts)",
      portal: "بوابة إدارة الفنادق والمنتجعات",
      route: "/hotels-admin-private-8822",
      name: "راشد الزدجالي - مدير قسم الفنادق",
      email: "hotel1@shouma.com",
      password: "hotel2026",
      status: "نشط"
    },
    {
      dept: "الفنادق والمنتجعات (Hotels & Resorts)",
      portal: "بوابة إدارة الفنادق والمنتجعات",
      route: "/hotels-admin-private-8822",
      name: "فاطمة المعمرية - مسؤول الحجوزات والمنتجعات",
      email: "hotel2@shouma.com",
      password: "hotel2026",
      status: "نشط"
    },
    {
      dept: "الفنادق والمنتجعات (Hotels & Resorts)",
      portal: "بوابة إدارة الفنادق والمنتجعات",
      route: "/hotels-admin-private-8822",
      name: "مدير الفنادق والمنتجعات",
      email: "hotel@shouma.com",
      password: "hotel2026",
      status: "نشط"
    },
    {
      dept: "تأجير السيارات (Car Rental)",
      portal: "لوحة إدارة مكتب تأجير السيارات",
      route: "/cnt-admin",
      name: "خالد السيابي - مدير مكتب السيارات",
      email: "cars1@shouma.com",
      password: "cars2026",
      status: "نشط"
    },
    {
      dept: "تأجير السيارات (Car Rental)",
      portal: "لوحة إدارة مكتب تأجير السيارات",
      route: "/cnt-admin",
      name: "سلطان الوهيبي - مشرف أسطول المركبات",
      email: "cars2@shouma.com",
      password: "cars2026",
      status: "نشط"
    },
    {
      dept: "تأجير السيارات (Car Rental)",
      portal: "لوحة إدارة مكتب تأجير السيارات",
      route: "/cnt-admin",
      name: "مدير مكتب السيارات",
      email: "cars@shouma.com",
      password: "cars2026",
      status: "نشط"
    },
    {
      dept: "إدارة الرحلات والفعاليات (Trips)",
      portal: "لوحة إدارة الرحلات الاستكشافية",
      route: "/trips-admin",
      name: "حمد الحارثي - مدير الرحلات والفعاليات",
      email: "trips1@shouma.com",
      password: "trips2026",
      status: "نشط"
    },
    {
      dept: "إدارة الرحلات والفعاليات (Trips)",
      portal: "لوحة إدارة الرحلات الاستكشافية",
      route: "/trips-admin",
      name: "أسماء البلوشية - منسق المغامرات والأنشطة",
      email: "trips2@shouma.com",
      password: "trips2026",
      status: "نشط"
    },
    {
      dept: "إدارة الرحلات والفعاليات (Trips)",
      portal: "لوحة إدارة الرحلات الاستكشافية",
      route: "/trips-admin",
      name: "مدير الرحلات والفعاليات",
      email: "trips@shouma.com",
      password: "trips2026",
      status: "نشط"
    },
    {
      dept: "التسويق والإعلانات (Marketing)",
      portal: "لوحة إدارة التسويق والإعلانات",
      route: "/mark-admin",
      name: "طارق البوسعيدي - مدير التسويق والإعلانات",
      email: "marketing1@shouma.com",
      password: "marketing2026",
      status: "نشط"
    },
    {
      dept: "التسويق والإعلانات (Marketing)",
      portal: "لوحة إدارة التسويق والإعلانات",
      route: "/mark-admin",
      name: "مريم الكندية - أخصائية الحملات الرقمية",
      email: "marketing2@shouma.com",
      password: "marketing2026",
      status: "نشط"
    },
    {
      dept: "التسويق والإعلانات (Marketing)",
      portal: "لوحة إدارة التسويق والإعلانات",
      route: "/mark-admin",
      name: "مسؤول التسويق والإعلانات",
      email: "marketing@shouma.com",
      password: "marketing2026",
      status: "نشط"
    },
    {
      dept: "المرشدون السياحيون (Tour Guides)",
      portal: "لوحة المرشدين السياحيين",
      route: "/guide-dashboard-private-4190",
      name: "يعقوب السالمي - كبير المرشدين",
      email: "guide1@shouma.com",
      password: "guide2026",
      status: "نشط"
    },
    {
      dept: "المرشدون السياحيون (Tour Guides)",
      portal: "لوحة المرشدين السياحيين",
      route: "/guide-dashboard-private-4190",
      name: "مرشد سياحي معتمد",
      email: "guide@shouma.com",
      password: "guide2026",
      status: "نشط"
    },
    {
      dept: "الدعم التقني والبرمجي (Tech)",
      portal: "لوحة الدعم التقني والبرمجي",
      route: "/admin-tch",
      name: "مازن الخروصي - مهندس الأنظمة والدعم",
      email: "tech1@shouma.com",
      password: "tech2026",
      status: "نشط"
    },
    {
      dept: "الدعم التقني والبرمجي (Tech)",
      portal: "لوحة الدعم التقني والبرمجي",
      route: "/admin-tch",
      name: "مدير الخدمات التقنية",
      email: "tech@shouma.com",
      password: "tech2026",
      status: "نشط"
    }
  ];

  const tableHeader = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 18, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "القسم / القطاع", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 18, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "لوحة التحكم والمسار", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "اسم الموظف / المسؤول", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 22, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "البريد الإلكتروني", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 14, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "كلمة المرور", bold: true, color: "FFFFFF", size: 20 })] })]
      }),
      new TableCell({
        shading: { fill: "1E293B" },
        width: { size: 8, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "الحالة", bold: true, color: "FFFFFF", size: 20 })] })]
      })
    ]
  });

  const tableRows = accountsData.map((acc, index) => {
    const isEven = index % 2 === 0;
    const bgFill = isEven ? "F8FAFC" : "FFFFFF";

    return new TableRow({
      children: [
        new TableCell({
          shading: { fill: bgFill },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: acc.dept, size: 18, bold: true, color: "0F172A" })] })]
        }),
        new TableCell({
          shading: { fill: bgFill },
          children: [
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: acc.portal, size: 17, color: "334155" })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `(${acc.route})`, size: 16, color: "2563EB", bold: true })] })
          ]
        }),
        new TableCell({
          shading: { fill: bgFill },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: acc.name, size: 18, bold: true, color: "1E293B" })] })]
        }),
        new TableCell({
          shading: { fill: bgFill },
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: acc.email, size: 18, bold: true, color: "059669" })] })]
        }),
        new TableCell({
          shading: { fill: bgFill },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: acc.password, size: 18, bold: true, color: "D97706" })] })]
        }),
        new TableCell({
          shading: { fill: bgFill },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: acc.status, size: 17, color: "166534", bold: true })] })]
        })
      ]
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: "دليل حسابات البريد الإلكتروني وكلمات المرور - منصة شوّع و شوّمتك",
                bold: true,
                size: 28,
                color: "1E293B"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "وثيقة رسمية تتضمن كافة اعتمادات الدخول للوحات التحكم والأقسام الفرعية المعتمدة في النظام",
                size: 18,
                color: "64748B",
                italic: true
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeader, ...tableRows]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ملاحظة أمنية: هذه البيانات سرية للغاية ومخصصة لاستخدام إدارة منصة شوّع وشوّمتك بسلطنة عمان.",
                size: 16,
                color: "DC2626",
                bold: true
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save to public directories
  const pathsToSave = [
    path.join(process.cwd(), "shouma_accounts_and_passwords.docx"),
    path.join(process.cwd(), "client", "public", "shouma_accounts_and_passwords.docx")
  ];

  for (const p of pathsToSave) {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, buffer);
    console.log(`Saved Word file to: ${p}`);
  }
}

generateDocx().catch(console.error);
