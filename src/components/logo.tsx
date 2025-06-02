import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/logo1.jpg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="h-8 max-w-[10.847rem] flex items-center">
      <Image
        src={logo}
        width={40} // set to your logo's natural width
        height={40} // set to your logo's natural height
        className="dark:hidden object-contain"
        alt="Dual-Dimension logo"
        role="presentation"
        quality={100}
      />
      <Image
        src={darkLogo}
        width={40}
        height={40}
        className="hidden dark:block object-contain"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}