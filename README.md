# Bánh Tai Quê Nhà

Website bán bánh tai gồm landing page cho khách và khu vực quản trị. Ứng dụng dùng Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Zod và React Hook Form.

## 1. Chạy local

Yêu cầu Node.js 20.9 trở lên và npm.

```powershell
npm install
Copy-Item .env.example .env.local
```

Điền thông tin Supabase và email quản trị vào `.env.local`, sau đó:

```powershell
npm run dev
```

Mở `http://localhost:3000`. Kiểm tra lint và production build:

```powershell
npm run lint
npm run build
```

## 2. Tạo project Supabase miễn phí

1. Tạo project tại [supabase.com/dashboard](https://supabase.com/dashboard) trên gói Free. Lưu mật khẩu database ở nơi an toàn.
2. Mở **Project Settings → API**. Chép **Project URL**, **anon/public key** và **service_role key** vào `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-secret>
   ADMIN_EMAILS=admin@example.com
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `SUPABASE_SERVICE_ROLE_KEY` là bí mật máy chủ: không đổi tên thành biến `NEXT_PUBLIC_*`, không đưa vào trình duyệt, git hay ảnh chụp màn hình.

3. Trong **SQL Editor**, chạy theo thứ tự:
   - [`supabase/migrations/202610110001_initial_schema.sql`](./supabase/migrations/202610110001_initial_schema.sql): tạo bảng, index, RLS, chính sách Storage, bucket `product-images`, hàm dashboard và hai sản phẩm mẫu.
   - [`supabase/migrations/202610110002_guest_orders.sql`](./supabase/migrations/202610110002_guest_orders.sql): nâng cấp checkout không tài khoản, bỏ `profiles`, `addresses`, `orders.user_id` nếu có và bật thống kê khách quen.
   - [`supabase/migrations/202610110003_ginger_product_image.sql`](./supabase/migrations/202610110003_ginger_product_image.sql): cập nhật ảnh bánh tai có đường gừng.
   - [`supabase/migrations/202610110004_shared_temporary_product_image.sql`](./supabase/migrations/202610110004_shared_temporary_product_image.sql): đặt ảnh tạm thời hiện tại cho cả hai loại bánh.

   Nếu project đã chạy các migration trước, chạy file thứ tư để cập nhật ảnh của cả hai sản phẩm.
4. Kiểm tra seed:

   ```sql
   select name, price, unit, is_active
   from public.products
   order by sort_order;
   ```

   Kết quả ban đầu có hai loại bánh, mỗi loại `50000` VND / `500g`.

## 3. Tạo một tài khoản admin

1. Trong **Authentication → Users**, chọn **Add user** và tạo duy nhất tài khoản admin bằng email/mật khẩu của bạn. Không có chức năng đăng ký admin trên website.
2. Email đó phải có trong `ADMIN_EMAILS` (có thể dùng danh sách email phân tách bằng dấu phẩy nếu cần).
3. Vì chính sách RLS kiểm tra claim không thể tự sửa bởi người dùng (`app_metadata.role`), gán role một lần từ **SQL Editor** sau khi tạo user:

   ```sql
   update auth.users
   set raw_app_meta_data =
     coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where lower(email) = lower('admin@example.com');
   ```

   Thay email mẫu bằng email admin thật và xác nhận lệnh cập nhật đúng một user. Đăng xuất rồi đăng nhập lại sau khi đổi metadata để phiên mới nhận claim `role`. Cả email allowlist và claim admin đều phải khớp thì mới vào được dashboard và các policy RLS mới cho phép đọc/sửa dữ liệu.

4. Mở `http://localhost:3000/admin/login` và đăng nhập.

## 4. Thay thông tin shop và ảnh

- Sửa tên shop, số điện thoại, link Zalo/Facebook, địa chỉ, phí ship và thông tin tài khoản ngân hàng trong [`src/config/site.ts`](./src/config/site.ts).
- Ảnh bánh tai có đường gừng trong `public/images/` dùng hình shop cung cấp; ảnh bánh không đường vẫn là SVG minh họa. Trong admin → **Sản phẩm**, tải ảnh JPG, PNG, WebP hoặc AVIF (tối đa 5MB) lên bucket `product-images` để thay ảnh sản phẩm.
- Nội dung trang chủ nằm trong [`src/app/(storefront)/page.tsx`](./src/app/(storefront)/page.tsx); thông tin giao hàng nếu khách chọn lưu chỉ được giữ trên thiết bị đó.
- Metadata chia sẻ mạng xã hội lấy từ `siteConfig`; ảnh Open Graph được sinh tại `/opengraph-image`. Sitemap ở `/sitemap.xml`.

## 5. Kiểm tra các luồng

- Khách: chọn số phần bánh → thêm giỏ → tải lại trang để xác nhận giỏ vẫn còn → nhập thông tin giao hàng → chọn COD/chuyển khoản → gửi đơn. Giá và phí ship được tính lại phía server.
- Liên hệ: gửi form và kiểm tra dòng mới trong `public.contacts`.
- Admin: lọc/tìm đơn, đổi trạng thái, xuất CSV; sửa giá/trạng thái bán và ảnh; đánh dấu tin nhắn đã đọc.
- Với mỗi đơn, API chỉ nhận slug và số lượng. Server đọc lại sản phẩm đang bán từ database để tính tổng, sau đó mới lưu snapshot vào `orders` và `order_items`.
- Nếu chưa cấu hình Supabase, landing page vẫn hiển thị nhưng danh sách sản phẩm ghi rõ chưa tải được; API gửi đơn/liên hệ trả lỗi cấu hình thay vì giả vờ thành công.

Rate limit chống spam và dò mã đơn hiện dùng bộ đếm trong bộ nhớ tiến trình (5 lần/phút cho mỗi IP và endpoint); đây là lớp bảo vệ cơ bản, không phải bộ đếm dùng chung giữa các instance serverless. Tra cứu bắt buộc khớp cả SĐT lẫn mã đơn và chỉ trả trạng thái, không trả thông tin cá nhân.

## 6. Deploy Vercel miễn phí

1. Đẩy project lên GitHub/GitLab/Bitbucket rồi import repository ở [vercel.com/new](https://vercel.com/new). Framework preset là Next.js; giữ build command `npm run build`.
2. Trong **Project Settings → Environment Variables**, thêm đủ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`, và `NEXT_PUBLIC_SITE_URL`. Đặt biến cho Production (và Preview nếu cần).
3. Đặt `NEXT_PUBLIC_SITE_URL` thành URL production, ví dụ `https://ten-shop.vercel.app`, rồi deploy lại để metadata/OG dùng đúng domain.
4. Trong **Supabase → Authentication → URL Configuration**, đặt Site URL bằng domain Vercel và thêm redirect URL `https://ten-shop.vercel.app/**` (cùng `http://localhost:3000/**` khi phát triển).
5. Sau deploy, thử trang chủ, `/sitemap.xml`, `/opengraph-image`, `/admin/login`, gửi thử đơn/liên hệ và kiểm tra bản ghi trong Supabase.

Website không cần cổng thanh toán, dịch vụ trả phí hay Supabase Edge Functions. Gói miễn phí có giới hạn dung lượng, lưu trữ và băng thông theo chính sách hiện hành của Vercel/Supabase.
