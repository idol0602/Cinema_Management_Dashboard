import { NavLink } from "react-router-dom";
import {
  Film,
  Users,
  DoorOpen,
  Calendar,
  Package,
  PartyPopper,
  UtensilsCrossed,
  FileType,
  FileText,
  Image,
  Percent,
  Bot,
  Ticket,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
    path: "/movies",
    icon: Film,
    label: "Phim",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Movie Types",
    path: "/movie-types",
    icon: FileType,
    label: "Thể loại phim",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Show Times",
    path: "/show-times",
    icon: Calendar,
    label: "Suất chiếu",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Rooms",
    path: "/rooms",
    icon: DoorOpen,
    label: "Phòng chiếu",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Combos",
    path: "/combos",
    icon: Package,
    label: "Combo",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Menu Items",
    path: "/menu-items",
    icon: UtensilsCrossed,
    label: "Menu Items",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Discounts",
    path: "/discounts",
    icon: Percent,
    label: "Giảm giá",
    allow: ["ADMIN"],
  },
  {
    name: "Events",
    path: "/events",
    icon: PartyPopper,
    label: "Sự kiện",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Posts",
    path: "/posts",
    icon: FileText,
    label: "Bài viết",
    allow: ["ADMIN"],
  },
  {
    name: "Slides",
    path: "/slides",
    icon: Image,
    label: "Slide Banner",
    allow: ["ADMIN"],
  },
  {
    name: "Users",
    path: "/users",
    icon: Users,
    label: "Người dùng",
    allow: ["ADMIN"],
  },
  {
    name: "Agent",
    path: "/agent",
    icon: Bot,
    label: "AI Agent SQL",
    allow: ["ADMIN"],
  },
  {
    name: "Orders",
    path: "/orders",
    icon: ShoppingBag,
    label: "Đơn hàng",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    label: "Cài đặt",
    allow: ["ADMIN"],
  },
];

function Navbar() {
  const { user } = useAuth();
  return (
    <nav className="border-b bg-background w-full">
      <div className="px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.allow.includes(user?.role as string)) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
