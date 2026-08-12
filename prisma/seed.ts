import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@mahirbakay.com" },
    update: {},
    create: {
      email: "admin@mahirbakay.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      permissions: {
        create: [
          { page: "dashboard", canRead: true, canWrite: true, canDelete: true },
          { page: "cms", canRead: true, canWrite: true, canDelete: true },
          { page: "archive", canRead: true, canWrite: true, canDelete: true },
          { page: "finance", canRead: true, canWrite: true, canDelete: true },
          { page: "stock", canRead: true, canWrite: true, canDelete: true },
          { page: "staff", canRead: true, canWrite: true, canDelete: true },
          { page: "users", canRead: true, canWrite: true, canDelete: true }
        ]
      }
    }
  })

  console.log("Created admin user:", admin.email)

  // Create sample about content
  const about = await prisma.about.upsert({
    where: { id: "default" },
    update: {},
    create: {
      title: "Hakkımızda",
      content: "Mahir Bakay Mühendislik olarak 20 yılı aşkın tecrübemizle inşaat sektöründe yenilikçi ve sürdürülebilir çözümler sunuyoruz. Kalite ve güvenilirlik ilkesiyle projelerimize hayat veriyoruz.",
      videoUrl: "/about-video.mp4"
    }
  })

  console.log("Created about content")

  // Create sample services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "service-1" },
      update: {},
      create: {
        id: "service-1",
        title: "İnşaat Mühendisliği",
        description: "Profesyonel inşaat mühendisliği hizmetleri ile projelerinizi hayata geçiriyoruz.",
        images: ["/images/service1-1.jpg", "/images/service1-2.jpg"]
      }
    }),
    prisma.service.upsert({
      where: { id: "service-2" },
      update: {},
      create: {
        id: "service-2",
        title: "Mimari Tasarım",
        description: "Estetik ve fonksiyonelliği birleştiren mimari tasarımlarımızla mekanlara değer katıyoruz.",
        images: ["/images/service2-1.jpg"]
      }
    }),
    prisma.service.upsert({
      where: { id: "service-3" },
      update: {},
      create: {
        id: "service-3",
        title: "Statik Hesap",
        description: "Yapıların güvenliği için detaylı statik hesaplamalar ve analizler yapıyoruz.",
        images: ["/images/service3-1.jpg"]
      }
    })
  ])

  console.log(`Created ${services.length} services`)

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: "project-1" },
      update: {},
      create: {
        id: "project-1",
        title: "Modern Plaza İş Merkezi",
        description: "İstanbul'un kalbinde, 25 katlı modern bir iş merkezi projesi.",
        images: ["/images/project1-1.jpg", "/images/project1-2.jpg"]
      }
    }),
    prisma.project.upsert({
      where: { id: "project-2" },
      update: {},
      create: {
        id: "project-2",
        title: "Eco Valley Konakları",
        description: "Doğa ile iç içe 500 konutluk bir yaşam projesi.",
        images: ["/images/project2-1.jpg"]
      }
    }),
    prisma.project.upsert({
      where: { id: "project-3" },
      update: {},
      create: {
        id: "project-3",
        title: "Tech Park Araştırma Merkezi",
        description: "Teknoloji geliştirme ve inovasyon merkezi.",
        images: ["/images/project3-1.jpg"]
      }
    })
  ])

  console.log(`Created ${projects.length} projects`)

  // Create contract templates
  const contractTemplates = await Promise.all([
    prisma.contractTemplate.upsert({
      where: { name: "İSG (İş Sağlığı ve Güvenliği) Taahhütnamesi" },
      update: {},
      create: {
        name: "İSG (İş Sağlığı ve Güvenliği) Taahhütnamesi",
        content: "İŞ SAĞLIĞI VE GÜVENLİĞİ TAAHHÜTNAMESİ\n\nBen {{PERSONEL_ADI}} (TC: {{KIMLIK_NO}}), {{PROJE_ADI}} şantiyesinde çalışırken İş Sağlığı ve Güvenliği kurallarına eksiksiz uyacağımı, tarafıma teslim edilen kişisel koruyucu donanımları (baret, yelek, iş ayakkabısı) her zaman kullanacağımı beyan ve taahhüt ederim.\n\nTarih: {{TARİH}}\nİmza:"
      }
    }),
    prisma.contractTemplate.upsert({
      where: { name: "Malzeme ve Donanım Zimmet Formu" },
      update: {},
      create: {
        name: "Malzeme ve Donanım Zimmet Formu",
        content: "DEMİRBAŞ / MALZEME ZİMMET TUTANAĞI\n\n{{PROJE_ADI}} projesinde görev yapmakta olan {{PERSONEL_ADI}}'na (TC: {{KIMLIK_NO}}) firmaya ait ekipmanlar/malzemeler eksiksiz ve çalışır durumda teslim edilmiştir. İlgili personel işten ayrılma durumunda bu malzemeleri iade etmekle yükümlüdür.\n\nTarih: {{TARİH}}\nTeslim Alan (İmza):"
      }
    }),
    prisma.contractTemplate.upsert({
      where: { name: "Genel Hizmet / Taşeron Sözleşmesi" },
      update: {},
      create: {
        name: "Genel Hizmet / Taşeron Sözleşmesi",
        content: "HİZMET SÖZLEŞMESİ\n\nBu sözleşme, {{PROJE_ADI}} projesi kapsamında görev alacak olan {{PERSONEL_ADI}} (TC: {{KIMLIK_NO}}) ile işveren arasında, {{TARİH}} tarihinde imza altına alınmıştır. Taraflar, şantiye yönetmeliklerine ve belirlenen hakediş kurallarına uymayı kabul eder.\n\nTarih: {{TARİH}}\nİmza:"
      }
    })
  ])

  console.log(`Created ${contractTemplates.length} contract templates`)

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })