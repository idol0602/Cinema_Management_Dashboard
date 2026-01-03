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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Movies",
    path: "/movies",
    icon: Film,
    label: "Phim",
  },
  {
    name: "Movie Types",
    path: "/movie-types",
    icon: FileType,
    label: "Thể loại phim",
  },
  {
    name: "Show Times",
    path: "/show-times",
    icon: Calendar,
    label: "Suất chiếu",
  },
  {
    name: "Rooms",
    path: "/rooms",
    icon: DoorOpen,
    label: "Phòng chiếu",
  },
  {
    name: "Combos",
    path: "/combos",
    icon: Package,
    label: "Combo",
  },
  {
    name: "Menu Items",
    path: "/menu-items",
    icon: UtensilsCrossed,
    label: "Menu Items",
  },
  {
    name: "Discounts",
    path: "/discounts",
    icon: Percent,
    label: "Giảm giá",
  },
  {
    name: "Events",
    path: "/events",
    icon: PartyPopper,
    label: "Sự kiện",
  },
  {
    name: "Posts",
    path: "/posts",
    icon: FileText,
    label: "Bài viết",
  },
  {
    name: "Slides",
    path: "/slides",
    icon: Image,
    label: "Slide Banner",
  },
  {
    name: "Users",
    path: "/users",
    icon: Users,
    label: "Người dùng",
  },
];

function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
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
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
