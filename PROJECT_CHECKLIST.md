# Project Checklist

Lưu ý cập nhật: Vite ở root đã được gỡ bỏ và dependencies frontend thừa đã dọn. Các mục dọn dẹp Vite trong phần “Build/Config” coi như hoàn tất.

Theo dõi các hạng mục còn lại để hoàn thiện DogeRat Web Admin v2.0.

## Frontend UI
- [ ] Device Detail page (hiển thị logs, lịch sử lệnh, trạng thái online)
- [ ] Register page (đăng ký người dùng nếu cần theo vai trò)
- [ ] Hoàn thiện shared toasts/alerts nhất quán (hiện dùng MatSnackBar rải rác)
- [ ] Kiểm tra responsive/UX các trang Dashboard, Devices, Users, Audit
- [ ] Kiểm tra/hoàn thiện theme, biến CSS, màu trạng thái

## Backend Tests & Quality
- [ ] Mở rộng unit test cho middleware (auth/authorize/validation)
- [ ] Unit test cho models (User/Device/Command) với DB mock/in-memory
- [ ] Integration tests cho các route chính (auth, devices, users)
- [ ] Thiết lập dữ liệu test fixtures và seed test
- [ ] Báo cáo coverage + cổng ngưỡng hợp lý (>=70%)

## CI/CD
- [x] Lint & format (đã có)
- [x] Backend tests (đã có cơ bản)
- [x] Build Backend/Frontend (đã có)
- [x] Docker build & push (đã có)
- [ ] Giai đoạn Deploy thực (thay vì placeholder echo)
- [ ] Thêm badge CI vào README
- [ ] Parallel hóa job và cache tối ưu

## Tài Liệu
- [ ] Bổ sung LICENSE (MIT) để khớp README
- [ ] Bổ sung CONTRIBUTING.md (workflow, code style, commit conventions)
- [ ] Thêm docs/api-spec.yaml (đồng bộ Swagger/OpenAPI)
- [ ] Architecture diagram (visual)
- [ ] Deployment guide chi tiết (best practices, HTTPS, reverse proxy)
- [ ] Security best practices guide

## Dọn Dẹp Build/Config
- [ ] Rà soát `vite.config.ts` ở root (plugin React không cần cho Angular) hoặc tách riêng
- [ ] Loại bỏ dependency React/Next không dùng trong `package.json` root
- [ ] Đồng bộ scripts build root với thực tế (Angular ở `client/` dùng Angular CLI)
- [ ] Kiểm tra alias path & tree-shaking

## Bảo Mật & Vận Hành
- [ ] Bật rate-limit chi tiết theo route nhạy cảm
- [ ] Bổ sung kiểm tra cấu hình CORS/Helmet production
- [ ] Script rotate JWT secret + quy trình thay đổi mật khẩu admin

## Nice-to-have
- [ ] E2E test tối thiểu cho luồng đăng nhập → dashboard → list devices
- [ ] Thống kê biểu đồ (chart) nâng cao ở Dashboard
- [ ] Thông báo realtime (snackbar/toast) tập trung
