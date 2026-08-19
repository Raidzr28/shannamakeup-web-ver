import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/ui/Icons";

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
      <div className="lg:hidden ambient-glow min-h-dvh flex flex-col pt-[58px] w-full max-w-[560px] mx-auto">
        <div className="px-5 pt-2 flex items-center gap-3">
          <Link
            href={back}
            className="w-[38px] h-[38px] rounded-[13px] flex items-center justify-center glass-light text-[15px] text-ink"
          >
            <BackIcon className="w-[18px] h-[18px]" />
          </Link>
        </div>
        <div className="px-5 pb-10">{children}</div>
      </div>

      <div className="hidden lg:flex ambient-glow flex-1 items-start justify-center px-11 py-16">
        <div className="w-full max-w-[460px]">{children}</div>
      </div>
    </>
  );
}
