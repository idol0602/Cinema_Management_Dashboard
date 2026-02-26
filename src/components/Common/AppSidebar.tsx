import { NavLink, useLocation } from "react-router-dom";
import {
  Film,
  Users,
  DoorOpen,
  Package,
  PartyPopper,
  FileText,
  Ticket,
  Settings,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
      {
        name: "Seat Types",
        path: "/seat-types",
        label: "Loại ghế",
        allow: ["ADMIN", "STAFF"],
      },
      {
        name: "Formats",
        path: "/formats",
        label: "Định dạng phòng",
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
        label: "Vật phẩm bán",
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
      {
        name: "Refunds",
        path: "/refunds",
        label: "Hoàn tiền",
        allow: ["ADMIN"],
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
      {
        name: "Event Types",
        path: "/event-types",
        label: "Loại sự kiện",
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
        name: "Roles",
        path: "/roles",
        label: "Vai trò",
        allow: ["ADMIN"],
      },
      {
        name: "Actions",
        path: "/actions",
        label: "Hành động",
        allow: ["ADMIN"],
      },
      {
        name: "Authorizes",
        path: "/authorizes",
        label: "Phân quyền",
        allow: ["ADMIN"],
      },
      {
        name: "Agent",
        path: "/agent",
        label: "AI Agent SQL",
        allow: ["ADMIN"],
      },
      {
        name: "Statisticals",
        path: "/statisticals",
        label: "Thống kê",
        allow: ["ADMIN"],
      },
    ],
  },
  {
    name: "Chat",
    path: "/chat",
    icon: MessageCircle,
    label: "Chat hỗ trợ",
    allow: ["ADMIN", "STAFF"],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: Settings,
    label: "Profile",
    allow: ["ADMIN", "STAFF"],
  },
];

export function AppSidebar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _user } = useAuth();
  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasAccess = (_item: Record<string, unknown>) => {
    // item.allow.includes(user?.role as string);
    return true;
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: { path: string }[]) => {
    return submenu.some((item) => location.pathname === item.path);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="pt-[30%]">
          <SidebarGroupLabel>Cinema Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const hasSubmenu = item.submenu && item.submenu.length > 0;

                if (!hasAccess(item)) return null;

                if (hasSubmenu) {
                  const visibleSubmenu = item.submenu!.filter(hasAccess);
                  if (visibleSubmenu.length === 0) return null;
                  const isOpen = isSubmenuActive(visibleSubmenu);

                  return (
                    <Collapsible
                      key={item.name}
                      defaultOpen={isOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.label}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {visibleSubmenu.map((subitem) => (
                              <SidebarMenuSubItem key={subitem.path}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location.pathname === subitem.path}
                                >
                                  <NavLink to={subitem.path}>
                                    <span>{subitem.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                } else {
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={location.pathname === item.path}
                      >
                        <NavLink
                          to={item.path as string}
                          className={({ isActive }) =>
                            cn(isActive && "font-medium")
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
