import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/ui/Icons";

/** The real brand lockup: the gold SHANNA monogram on its own rose field.
 *
 * The asset is an opaque JPEG, so it cannot be dropped into nav chrome at 28px
 * — it needs to sit in a frame big enough to be the composition it is. The auth
 * screens are that place: signing in is the one moment the brand introduces
 * itself rather than getting out of the way of the work. */
function BrandPlate() {
  return (
    <div className="relative mb-7 h-[148px] w-full overflow-hidden rounded-[26px_26px_8px_8px] border border-prada/40">
      <Image
        src="/brand/shanna-logo-lockup.jpg"
        alt="Shanna Make Up"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 460px"
        className="object-cover"
      />
    </div>
  );
}

/** Auth screens share one body; only the chrome around it differs — a back
 * chevron on the phone, a centred column on the desktop site. */
export function AuthShell({
  back = "/",
  children,
}: {
  back?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="lg:hidden ink-field min-h-dvh flex flex-col pt-[58px] w-full max-w-[560px] mx-auto">
        <div className="px-5 pt-2 flex items-center gap-3">
          <Link
            href={back}
            className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center plate-quiet text-melati"
          >
            <BackIcon className="w-[18px] h-[18px]" />
          </Link>
        </div>
        <div className="px-5 pt-5 pb-10">
          <BrandPlate />
          {children}
        </div>
      </div>

      <div className="hidden lg:flex ink-field flex-1 items-start justify-center px-11 py-16">
        <div className="w-full max-w-[460px]">
          <BrandPlate />
          {children}
        </div>
      </div>
    </>
  );
}
