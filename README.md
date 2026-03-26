# Dashboard - Trang Quản Trị Rạp Chiếu Phim

## 📋 Giới Thiệu

Dashboard là ứng dụng quản trị cho hệ thống quản lý rạp chiếu phim META CINEMA. Nó cung cấp giao diện quản lý toàn bộ hoạt động của rạp, từ quản lý phim, suất chiếu, đơn hàng cho đến phân tích doanh số và báo cáo.

## 🛠️ Công Nghệ Sử Dụng

### Core Framework
- **Build Tool**: Vite v7
- **Framework**: React v19
- **Language**: TypeScript (strict mode)
- **Node Version**: 16+

### UI & Styling
- **CSS Framework**: Tailwind CSS v3
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Routing & State
- **Router**: React Router v7
- **State**: Zustand
- **Form**: React Hook Form v7
- **Validation**: Zod v4
- **API**: TanStack React Query v5

### Data & Features
- **Charts**: Recharts v3
- **PDF Export**: jsPDF v4
- **Rich Editor**: TipTap v3
- **Real-time**: Socket.io Client

### Development
- **Linting**: ESLint v9
- **Type Checking**: TypeScript v5.9

## ⭐ Tính Năng Nổi Bật

- ✅ **Dashboard Analytics**: Thống kê doanh số, biểu đồ
- ✅ **Quản Lý Phim**: CRUD phim, danh mục
- ✅ **AI Phân Tích Dữ Liệu**: Query, phân tích dữ liệu, tạo biểu đồ trực quan
- ✅ **Suất Chiếu**: Lịch trình, quản lý room
- ✅ **Quản Lý Vé**: Giá vé, booking
- ✅ **Quản Lý Ghế**: Layout, loại ghế
- ✅ **Combo & Menu**: Tạo, cập nhật bundles
- ✅ **Sự Kiện**: Quản lý sự kiện
- ✅ **Giảm Giá**: Mã khuyến mãi
- ✅ **Đơn Hàng**: Quản lý order, hoàn tiền
- ✅ **Người Dùng**: Role, permission management
- ✅ **Báo Cáo**: PDF export, statistics
- ✅ **Chat Staff**: Real-time communication

## 🚀 Quick Start

```bash
# Cài đặt
cd dashboard-app
npm install

# Chạy dev server
npm run dev

# Mở http://localhost:5173
```

## 📝 Các Lệnh Khả Dụng

```bash
npm run dev              # Chạy dev server
npm run build            # Build production
npm run preview          # Preview build
npm run lint             # Kiểm tra linting
npm run lint:fix         # Sửa linting
```

## 🔧 Cấu Hình Environment

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ENABLE_AI=true
VITE_ENABLE_CHAT=true
```

## 📁 Cấu Trúc Thư Mục

```
dashboard-app/
├── src/
│   ├── pages/           # Admin pages
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── routes/          # Router setup
│   ├── schemas/         # Validation schemas
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json         # Dependencies
```

## 📊 Quản Lý Modules

- **Movies**: Create, edit, delete movies
- **ShowTimes**: Schedule management
- **Tickets**: Pricing & inventory
- **Orders**: Order tracking
- **Users**: User management
- **Combos**: Bundle management
- **Events**: Event scheduling
- **Reports**: Analytics & exports

## 📦 Dependencies Chính

- **vite** - Build tool
- **react** - UI library
- **typescript** - Type system
- **tailwindcss** - Styling
- **zustand** - State management
- **react-query** - Data fetching
- **recharts** - Charting
- **react-router-dom** - Routing

## 🔐 Security & Permissions

- Role-based access control
- Permission validation
- Protected routes
- Token-based auth

## 📄 License

Private - All rights reserved

---

**Version**: 0.0.0  
**Last Updated**: 2026-03-26  
**Build Tool**: Vite v7  
**Node**: 16+  
**Package Manager**: npm/yarn
