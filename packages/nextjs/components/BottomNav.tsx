"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBarIcon, HomeIcon, PlusCircleIcon, QrCodeIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import {
  ChartBarIcon as ChartBarIconSolid,
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/24/solid";

const navigation = [
  { name: "Feed", href: "/feed", Icon: HomeIcon, ActiveIcon: HomeIconSolid },
  { name: "Create", href: "/create", Icon: PlusCircleIcon, ActiveIcon: PlusCircleIconSolid },
  { name: "Verify", href: "/verify", Icon: QrCodeIcon, ActiveIcon: QrCodeIconSolid },
  { name: "Profile", href: "/profile", Icon: UserCircleIcon, ActiveIcon: UserCircleIconSolid },
  { name: "DAO", href: "/governance", Icon: ChartBarIcon, ActiveIcon: ChartBarIconSolid },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 safe-area-bottom md:hidden">
      <nav className="flex justify-around items-center h-16">
        {navigation.map(item => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = isActive ? item.ActiveIcon : item.Icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-base-content/70"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
