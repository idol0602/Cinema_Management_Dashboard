import { NavLink } from "react-router-dom";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Film,
  Users,
  DoorOpen,
  Package,
  PartyPopper,
  FileText,
  Ticket,
  Settings,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import { useTheme } from "../theme-provider";

const navItems = [
  {
    name: "Tickets",
    path: "/ticket",
    icon: Ticket,
    label: "Mua vé",
    allow: ["STAFF"],
  },
  {
    name: "Movies",
    label: "Quản lý phim",
    icon: Film,
    allow: ["ADMIN", "STAFF"],
    submenu: [
      {
        name: "Movies",
        path: "/movies",
        label: "Danh sách phim",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Movie Types",
        path: "/movie-types",
        label: "Thể loại phim",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Show Times",
        path: "/show-times",
        label: "Suất chiếu",
        allow: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    name: "Facilities",
    label: "Cơ sở vật chất",
    icon: DoorOpen,
    allow: ["ADMIN", "STAFF"],
    submenu: [
      {
        name: "Rooms",
        path: "/rooms",
        label: "Phòng chiếu",
        allow: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    name: "Products",
    label: "Sản phẩm & Bán hàng",
    icon: Package,
    allow: ["ADMIN", "STAFF"],
    submenu: [
      {
        name: "Combos",
        path: "/combos",
        label: "Combo",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Menu Items",
        path: "/menu-items",
        label: "Menu Items",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Ticket Prices",
        path: "/ticket-prices",
        label: "Giá vé",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Orders",
        path: "/orders",
        label: "Đơn hàng",
        allow: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    name: "Promotions",
    label: "Khuyến mãi & Sự kiện",
    icon: PartyPopper,
    allow: ["ADMIN", "STAFF"],
    submenu: [
      {
        name: "Discounts",
        path: "/discounts",
        label: "Giảm giá",
        allow: ["ADMIN"],
      },
      {
        name: "Events",
        path: "/events",
        label: "Sự kiện",
        allow: ["ADMIN", "STAFF"],
      },
    ],
  },
  {
    name: "Content",
    label: "Nội dung",
    icon: FileText,
    allow: ["ADMIN"],
    submenu: [
      {
        name: "Posts",
        path: "/posts",
        label: "Bài viết",
        allow: ["ADMIN"],
      },
      {
        name: "Slides",
        path: "/slides",
        label: "Slide Banner",
        allow: ["ADMIN"],
      },
    ],
  },
  {
    name: "Management",
    label: "Quản lý hệ thống",
    icon: Users,
    allow: ["ADMIN"],
    submenu: [
      {
        name: "Users",
        path: "/users",
        label: "Người dùng",
        allow: ["ADMIN"],
      },
      {
        name: "Agent",
        path: "/agent",
        label: "AI Agent SQL",
        allow: ["ADMIN"],
      },
    ],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: Settings,
    label: "Profile",
    allow: ["ADMIN", "STAFF"],
  },
];

function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [submenuPos, setSubmenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const hasAccess = (item: any) => item.allow.includes(user?.role as string);

  const handleMenuClick = (itemName: string, buttonEl: HTMLButtonElement) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);

    if (openSubmenu !== itemName) {
      const rect = buttonEl.getBoundingClientRect();
      setSubmenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  return (
    <nav className="border-b bg-background w-full">
      <div className="px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;

            if (!hasAccess(item)) return null;

            if (hasSubmenu) {
              const visibleSubmenu = item.submenu.filter(hasAccess);
              if (visibleSubmenu.length === 0) return null;

              return (
                <div key={item.name} className="relative group/menu">
                  <button
                    ref={(el) => {
                      if (el) buttonRefs.current[item.name] = el;
                    }}
                    onClick={(e) => handleMenuClick(item.name, e.currentTarget)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      "hover:bg-accent hover:text-accent-foreground",
                      openSubmenu === item.name
                        ? "bg-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        openSubmenu === item.name && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Desktop Submenu (Hover) */}
                  <div className="absolute left-0 top-full hidden group-hover/menu:block bg-background border border-border rounded-lg shadow-lg z-50 min-w-48 mt-1">
                    {visibleSubmenu.map((subitem) => (
                      <NavLink
                        key={subitem.path}
                        to={subitem.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b last:border-b-0",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          )
                        }
                      >
                        <span>{subitem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            } else {
              return (
                <NavLink
                  key={item.path}
                  to={item.path as string}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            }
          })}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Portal */}
      {openSubmenu &&
        createPortal(
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenSubmenu(null)}
          >
            <div
              className="fixed bg-background border border-border rounded-lg shadow-lg z-50 min-w-48"
              style={{
                top: `${submenuPos.top}px`,
                left: `${submenuPos.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {navItems
                .find((item) => item.name === openSubmenu)
                ?.submenu?.filter(hasAccess)
                .map((subitem) => (
                  <NavLink
                    key={subitem.path}
                    to={subitem.path}
                    onClick={() => setOpenSubmenu(null)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b last:border-b-0 block w-full text-left",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )
                    }
                  >
                    <span>{subitem.label}</span>
                  </NavLink>
                ))}
            </div>
          </div>,
          document.body
        )}
    </nav>
  );
}

export default Navbar;
