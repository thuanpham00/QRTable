# Sự khác nhau giữa Role Based Access Control và Permission Based Access Control

## Access Control

Access Control là kiểm soát quyền truy cập. Có 2 kiểu phổ biến là

- **Role Based Access Control (RBAC)**: kiểm soát quyền truy cập dựa trên vai trò của người dùng.
- **Permission Based Access Control (PBAC)**: kiểm soát quyền truy cập dựa trên quyền trên từng chức năng của người dùng.

## Role Based Access Control (RBAC)

Hệ thống quản lý quán ăn sẽ có 3 role chính

- **Admin**: có quyền thao tác mọi chức năng trên hệ thống
- **Employee**: có quyền thao tác một số chức năng như tạo order, xem order nhưng không thể quản lý nhân viên khác
- **Guest**: chỉ có quyền xem menu, tạo order

Các quyền hạn ở mỗi role thường được định nghĩa cố định khi code.

Tất nhiên bạn cũng có thể code 1 hệ thống thay đổi quyền hạn trên mỗi role 1 cách linh hoạt hơn. Lưu ý là thay đổi quyền hạn trên mỗi role chứ không phải trên mỗi tài khoản.

Mỗi account sẽ được gắn với 1 role trên.

## Permission Based Access Control (PBAC)

Thay vì chia theo role thì hệ thống sẽ chia theo từng quyền hạn cụ thể.

Ví dụ khi tạo tài khoản, bạn sẽ được gắn với quyền hạn cơ bản như: READ_PROFILE, WRITE_PROFILE, READ_ORDER, WRITE_ORDER

Khi cần thêm quyền hạn mới, admin sẽ thêm quyền hạn đó cho tài khoản cụ thể.

Đây vừa là ưu điểm vừa là nhược điểm:

- Nó linh hoạt hơn RBAC vì có thể thêm quyền hạn mới mà không cần phải tạo role mới
- Nhưng cũng khó kiểm các tài khoản nếu có quá nhiều quyền hạn, có quá nhiều tài khoản

# Stateful Authentication

Token có thể là 1 chuỗi ngẫu nhiên, 1 chuỗi mã hóa hoặc JWT

Token sẽ được lưu trên server (trong RAM server hoặc trong database) và client.

Mỗi lần client gửi request lên server, server sẽ request vào database để kiểm tra token có hợp lệ không.

# Stateless Authentication

Token thường là JWT (JSON Web Token)

Token không cần lưu ở server, chỉ cần lưu ở client là được.

Mỗi lần client gửi request lên server, server sẽ kiểm tra token có hợp lệ không dựa trên thuật toán mã hóa, không cần request vào database.

# So sánh

| Stateful | Stateless |
|----------|-----------|
| ✅Token ngắn, vì không phải lưu thông tin vào token | ❌Lưu thông tin vào token nên token thường rất dài, chiếm bộ nhớ |
| ❌Cần dùng thông tin gì về user lại phải request đến db, ở client hay server đều vậy | ✅Vì lưu thông tin vào token nên đôi khi ở client không cần request đến server để lấy info, server không cần request db để lấy info |
| ❌Khi thêm server service mới, cần xác thực request thì lại phải gọi đến DB để kiểm tra phức tạp, tốn thời gian | ✅Nếu có nhiều server service, bạn cần xác thực 1 request thì chỉ cần validate token, không cần phải request đến db, vậy nên dễ scale theo chiều ngang |
| ✅Revoke token, change role user bất cứ lúc nào, client sẽ có hiệu nghiệm ngay lập tức | ❌Vì server không lưu token nên khi không có cách nào revoke token của 1 người, cần phải đợi token đó hết hạn. Khi change role cũng tương tự như vậy |
