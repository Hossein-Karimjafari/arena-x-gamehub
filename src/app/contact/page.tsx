import { SITE } from "@/lib/constants";
import SectionHeading from "@/components/SectionHeading";
import CoverArt from "@/components/CoverArt";
import ContactForm from "./ContactForm";
import { IconInstagram, IconTelegram, IconWhatsApp, IconDiscord } from "@/components/icons";

export const metadata = { title: "تماس با ما", description: "آدرس، تلفن، ساعت کاری و فرم تماس گیم‌نت آرنا ایکس" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <SectionHeading kicker="CONTACT" title="📞 تماس با آرنا" desc="سوالی داری؟ ایونت خصوصی می‌خوای؟ فقط پیام بده." />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <ContactForm />

          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">⏰ ساعت کاری</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex justify-between"><span>شنبه تا پنجشنبه</span><span className="font-bold text-white">۹ صبح — ۱۲ شب</span></p>
              <p className="flex justify-between"><span>جمعه‌ها</span><span className="font-bold text-neon-green">۲۴ ساعته 🌙</span></p>
            </div>
          </div>

          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">💬 شبکه‌های اجتماعی</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: SITE.socials.instagram, label: "اینستاگرام", Icon: IconInstagram },
                { href: SITE.socials.telegram, label: "تلگرام", Icon: IconTelegram },
                { href: SITE.socials.whatsapp, label: "واتساپ", Icon: IconWhatsApp },
                { href: SITE.socials.discord, label: "دیسکورد", Icon: IconDiscord },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="chip flex items-center gap-2 !px-4 !py-2 hover:!border-neon-purple/60 hover:!text-white">
                  <Icon className="h-4 w-4" /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass p-6">
            <h3 className="mb-4 font-black text-white">📍 اطلاعات تماس</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>🏢 {SITE.address}</li>
              <li>☎️ تلفن ثابت: <span dir="ltr" className="font-bold text-white">{SITE.phone}</span></li>
              <li>📱 موبایل / واتساپ: <span dir="ltr" className="font-bold text-white">{SITE.mobile}</span></li>
              <li>✉️ ایمیل: <a href="mailto:hi@arenax.gg" className="text-neon-purple">hi@arenax.gg</a></li>
            </ul>
          </div>

          <CoverArt
            emoji="📍"
            src="/images/contact-map.jpg"
            gradient="violet"
            className="h-72 !rounded-xl"
            alt={`نقشه — ${SITE.address}`}
          >
            <div className="absolute inset-x-0 bottom-0 p-4 text-center" style={{ background: "linear-gradient(to top, rgba(0,0,0,.75), transparent)" }}>
              <p className="font-bold text-white">موقعیت آرنا ایکس روی نقشه</p>
              <p className="mt-1 text-xs text-slate-300">{SITE.address}</p>
              <a href="https://www.google.com/maps/search/?api=1&query=35.7560,51.4360" target="_blank" rel="noreferrer" className="btn-outline mt-3 inline-block !py-2 !text-xs">نمایش در نقشه گوگل ←</a>
            </div>
          </CoverArt>

          <div className="glass p-6 text-center">
            <p className="text-sm text-slate-300">پاسخ‌گویی سریع‌تر؟ واتساپ بزن 👇</p>
            <a href={SITE.socials.whatsapp} target="_blank" rel="noreferrer" className="btn-neon mt-4 inline-block !py-2.5 !text-sm">💬 چت واتساپ</a>
          </div>
        </div>
      </div>
    </div>
  );
}
