# Biến môi trường
có 2 loại biến môi trường

- Loại dành cho server -> chỉ server chỉ truy cập được
`DB_ABC` -> chỉ dùng được ở server

- Loại dành cho browser (client) -> cả browser và server đều truy cập được
vd đặt tên biến dành cho browser: `NEXT_PUBLIC_ANALYTICS_biến`
`NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000` -> dùng được ở server và client

# Quản lý state global
- Context API
- Redux Toolkit + RTK Query
- Zustand

1/ Context API:
- CÓ THỂ dùng global (wrap cả app) hoặc local (wrap vài component)
- Vấn đề: Performance - khi state thay đổi, MỌI component dùng context đều re-render
- Thường dùng cho: data ít thay đổi (theme, auth, language)
- Ví dụ trong dự án: theme-provider.tsx, app-provider.tsx

2/Zustand:
- Thiết kế cho global state
- Performance tốt: chỉ component subscribe field cụ thể mới re-render
- Không cần Provider wrapper
- Thường dùng cho: data thường xuyên thay đổi (cart, UI state, filters)

Tóm lại:

`Context: Có thể global NHƯNG performance kém khi data thay đổi nhiều`

`Zustand: Global tốt hơn với performance cao`

Context: useContext subscribe toàn bộ context object → bất kỳ field nào thay đổi đều trigger re-render
Zustand: useStore với selector chỉ subscribe field cụ thể → chỉ re-render khi field đó thay đổi

```
// AppContext có: { user, cart, theme }

// Component A - chỉ cần user
const { user } = useContext(AppContext); // Phải lấy từ toàn bộ context
return <div>{user.name}</div>; 

// Khi cart thay đổi:
// → AppContext value thay đổi
// → Component A vẫn re-render (vì nó đang subscribe cả AppContext)
// → Dù Component A chỉ dùng user, không quan tâm cart
```

```
// Store có: { user, cart, theme }

// Component B - chỉ cần user  
const user = useStore((state) => state.user); // Chỉ subscribe user
return <div>{user.name}</div>;

// Khi cart thay đổi:
// → Component B KHÔNG re-render
// → Vì nó chỉ subscribe state.user, không subscribe state.cart
```

# Server component & Client component
🖥️ Server Component (Mặc định - Không cần "use client")
Khi nào dùng:

✅ Trang hiển thị nội dung tĩnh (landing page, about)
✅ Trang public cần SEO (menu khách hàng xem)
✅ Layout, root layout
✅ Fetch data 1 lần, không có interaction

💻 Client Component (Cần "use client")
Khi nào dùng:

✅ Trang /manage/ (quản lý admin)
✅ Có form, input, buttons
✅ Dùng React hooks (useState, useEffect, useRouter)
✅ Có mutations (create, update, delete)
✅ Real-time updates, websocket
✅ Event handlers (onClick, onChange)
✅ React Query hooks

# React-query
Ví dụ:

["menus", {page: 1, limit: 10}] ✅ sẽ được invalidate
["menus", {page: 5, limit: 20, search: "pizza"}] ✅ sẽ được invalidate
["menus", {}] ✅ sẽ được invalidate
["menus"] ✅ sẽ được invalidate

Hiện tại có 3 trang là server component -> SEO
- Home - / - (trang chủ)
- Menu - /menu - (menu)
- Chi tiết món ăn - /dishes/:id - (xem chi tiết món ăn)

# PPR = Static Shell (build time) + Dynamic Islands (runtime)

```tsx
┌──────────────────────────────────────┐
│  PAGE.TSX (Static Shell)             │ ← Prerendered at build
│  ┌────────────────────────────────┐  │
│  │ <Suspense> (Boundary)          │  │
│  │   DYNAMIC COMPONENT            │  │ ← Rendered at runtime
│  │   (useSearchParams, fetch...)  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

Timeline:
├─ 0ms    → Browser nhận static HTML (Card hiển thị ngay)
├─ 50ms   → Server render DishTable với searchParams
├─ 100ms  → Stream HTML fragment vào Suspense boundary
└─ 150ms  → Hydration hoàn tất, trang interactive

# 'use client'
 * Nếu parent component đã là Client Component (có "use client"), thì tất cả child components tự động trở thành Client Components, không cần khai báo lại.

# Suspense chặn static rendering
- nếu dùng useSearchParams (dùng Suspense bọc component) thì sẽ bị
- tình trạng là bên ngoài static bên trong dynamic vì Suspense chặn static không render html hết page - cách cũ 

- cách mới là ko dùng Suspense nữa dùng hook SearchParamsLoader thì lúc này sẽ render được hết page - full html

# Note về SEO
1. Những page mà cần login vào mới xem được như /manage, gọi món, profile,... thì không cần SEO: tức là không cần SSR, và noindex meta. Nhưng
vẫn nên có thẻ title, meta description

2. Page 'use client' thì không thêm meta tag được, vậy nên phải để page là SSR

3. Canonical link nhớ thêm `/en` và `/vi` vào

# Note convert định dạng Date
```tsx
     {new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
     })}
```