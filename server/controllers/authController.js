const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db'); // nếu cần dùng trực tiếp

// Helper: Tạo JWT token
const generateToken = (userId, vaiTroId) => {
  return jwt.sign(
    { userId, vaiTroId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' } // Token hết hạn sau 7 ngày
  );
};

// POST /api/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });

  try {
    // Query user với thông tin vai trò (JOIN với bảng vaitro)
    const sql = `
      SELECT n.*, v.TenVaiTro, v.VaiTroID
      FROM nguoidung n
      LEFT JOIN vaitro v ON n.VaiTroHoatDongID = v.VaiTroID
      WHERE n.Email = ?
    `;
    const [rows] = await db.query(sql, [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    const user = rows[0];

    // NOTE: hiện project chưa có hashing (bcrypt). Đây là so sánh đơn giản — đổi sang bcrypt trong production.
    if (user.MatKhauHash !== password) return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });

    // Tạo JWT token
    const token = generateToken(user.NguoiDungID, user.VaiTroHoatDongID);

    // loại bỏ trường mật khẩu khi trả về
    const { MatKhauHash, ...safeUser } = user;
    
    res.json({ 
      success: true,
      token,
      user: safeUser 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đăng nhập' });
  }
};

// POST /api/register
exports.register = async (req, res) => {
  const { name, email, phone, password, roleId } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'name, email, phone, password là bắt buộc' });
  }

  // Chỉ cho phép đăng ký Khách hàng (1) hoặc Chủ dự án (3)
  const allowedPublicRoles = [1, 3];
  const safeRoleId = allowedPublicRoles.includes(Number(roleId)) ? Number(roleId) : 1;

  try {
    const matKhauHash = crypto.createHash('md5').update(String(password)).digest('hex');
    const [result] = await User.createNguoiDung(name, email, phone, matKhauHash, safeRoleId);

    const token = generateToken(result.insertId, safeRoleId);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.insertId,
        TenDayDu: name,
        Email: email,
        SoDienThoai: phone,
        VaiTroHoatDongID: safeRoleId,
        TenVaiTro: safeRoleId === 3 ? 'Chủ dự án' : 'Khách hàng'
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi đăng ký' });
  }
};