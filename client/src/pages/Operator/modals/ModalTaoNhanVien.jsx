import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import CryptoJS from "crypto-js";
import ModalOperator from "../../../components/Operator/shared/ModalOperator";
import { operatorApi } from "../../../api/operatorApi";
import "./ModalTaoNhanVien.css";

/**
 * Modal tạo nhân viên mới
 * UC-OPER-05: Tạo tài khoản Nhân viên
 */
const ModalTaoNhanVien = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tenDayDu: "",
    email: "",
    soDienThoai: "",
    khuVucPhuTrachID: "",
    ngayBatDau: new Date().toISOString().split("T")[0],
    password: CryptoJS.MD5("123456").toString(), // MD5 hash của "123456"
  });
  const [errors, setErrors] = useState({});
  const [khuVucInfo, setKhuVucInfo] = useState(null);
  const [isLoadingKhuVuc, setIsLoadingKhuVuc] = useState(false);

  const [operatorId, setOperatorId] = useState(() => {
    try {
      const operator = localStorage.getItem("user");
      if (operator) {
        const parsed = JSON.parse(operator);
        return parsed.NguoiDungID || -1;
      }
    } catch (e) {
      return -1;
    }
    return -1;
  });

  // Load khu vực mặc định từ API khi component mount
  useEffect(() => {
    const loadKhuVucMacDinh = async () => {
      try {
        setIsLoadingKhuVuc(true);
        console.log("[ModalTaoNhanVien] Gọi API: getKhuVucMacDinh()");
        const response = await operatorApi.nhanVien.getKhuVucMacDinh();

        console.log("[ModalTaoNhanVien] Response thành công:", response.data);

        if (response.data.success) {
          setKhuVucInfo(response.data.data);
        }
      } catch (error) {
        console.error("[ModalTaoNhanVien] Lỗi:", error);
        console.error(
          "[ModalTaoNhanVien] Error response:",
          error.response?.data
        );
        console.error(
          "[ModalTaoNhanVien] Error status:",
          error.response?.status
        );
        console.error("[ModalTaoNhanVien] Error URL:", error.config?.url);
      } finally {
        setIsLoadingKhuVuc(false);
      }
    };

    loadKhuVucMacDinh();
  }, []);

  const taoMutation = useMutation({
    mutationFn: (data) => operatorApi.nhanVien.taoMoi(data),
    onSuccess: () => {
      alert("✅ Tạo nhân viên thành công!");
      onSuccess();
    },
    onError: (error) => {
      alert(`❌ Lỗi: ${error.response?.data?.message || error.message}`);
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenDayDu || formData.tenDayDu.trim().length < 3) {
      newErrors.tenDayDu = "Họ tên phải có ít nhất 3 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.soDienThoai || !phoneRegex.test(formData.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại phải có 10 chữ số";
    }

    if (!formData.ngayBatDau) {
      newErrors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await taoMutation.mutateAsync({
      TenDayDu: formData.tenDayDu.trim(),
      Email: formData.email.trim(),
      SoDienThoai: formData.soDienThoai,
      KhuVucChinhID: khuVucInfo?.KhuVucChinhID || null,
      KhuVucPhuTrachID: khuVucInfo?.KhuVucPhuTrachID || null,
      NgayBatDau: formData.ngayBatDau,
      operatorId: operatorId
    });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <ModalOperator
      isOpen={true}
      onClose={onClose}
      title="➕ Tạo Nhân viên mới"
      size="medium"
    >
      <div className="modal-tao-nv__content">
        {/* Info */}
        <div className="modal-tao-nv__info">
          💡 Sau khi tạo, nhân viên sẽ nhận email hướng dẫn đặt mật khẩu và đăng
          nhập hệ thống.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-tao-nv__form">
          {/* Họ tên */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="tenDayDu" className="modal-tao-nv__label">
              Họ và tên <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="text"
              id="tenDayDu"
              className={`modal-tao-nv__input ${errors.tenDayDu ? "has-error" : ""
                }`}
              placeholder="Nguyễn Văn A"
              value={formData.tenDayDu}
              onChange={(e) => handleChange("tenDayDu", e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.tenDayDu && (
              <span className="modal-tao-nv__error">{errors.tenDayDu}</span>
            )}
          </div>

          {/* Email */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="email" className="modal-tao-nv__label">
              Email <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="email"
              id="email"
              className={`modal-tao-nv__input ${errors.email ? "has-error" : ""
                }`}
              placeholder="nhanvien@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.email && (
              <span className="modal-tao-nv__error">{errors.email}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="soDienThoai" className="modal-tao-nv__label">
              Số điện thoại <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="tel"
              id="soDienThoai"
              className={`modal-tao-nv__input ${errors.soDienThoai ? "has-error" : ""
                }`}
              placeholder="0901234567"
              value={formData.soDienThoai}
              onChange={(e) => handleChange("soDienThoai", e.target.value)}
              maxLength={10}
              disabled={taoMutation.isLoading}
            />
            {errors.soDienThoai && (
              <span className="modal-tao-nv__error">{errors.soDienThoai}</span>
            )}
          </div>

          {/* Khu vực phụ trách */}
          <div className="modal-tao-nv__form-group">
            <label className="modal-tao-nv__label">
              Khu vực phụ trách
            </label>

            {/* Sử dụng div giả lập input để đồng bộ giao diện */}
            <div className="modal-tao-nv__input modal-tao-nv__input--readonly">
              {isLoadingKhuVuc ? (
                <span style={{ color: "#999" }}>Đang tải...</span>
              ) : khuVucInfo ? (
                <div className="kv-display-row">
                  {/* Hiển thị icon cho sinh động (tùy chọn) */}
                  <span className="kv-icon">📍</span>

                  {/* Logic hiển thị gọn gàng trên 1 dòng hoặc 2 dòng nhỏ */}
                  <span className="kv-text">
                    {khuVucInfo.TenKhuVucChinh || "N/A"}
                    {khuVucInfo.TenKhuVucPhuTrach && (
                      <>
                        <span className="kv-separator"> ➤ </span>
                        {khuVucInfo.TenKhuVucPhuTrach}
                      </>
                    )}
                    {!khuVucInfo.TenKhuVucChinh && !khuVucInfo.TenKhuVucPhuTrach && (
                      "Chưa được gán khu vực"
                    )}
                  </span>
                </div>
              ) : (
                <span style={{ color: "#999" }}>Không có thông tin</span>
              )}
            </div>
          </div>

          {/* Ngày bắt đầu */}
          <div className="modal-tao-nv__form-group">
            <label htmlFor="ngayBatDau" className="modal-tao-nv__label">
              Ngày bắt đầu <span className="modal-tao-nv__required">*</span>
            </label>
            <input
              type="date"
              id="ngayBatDau"
              className={`modal-tao-nv__input ${errors.ngayBatDau ? "has-error" : ""
                }`}
              value={formData.ngayBatDau}
              onChange={(e) => handleChange("ngayBatDau", e.target.value)}
              disabled={taoMutation.isLoading}
            />
            {errors.ngayBatDau && (
              <span className="modal-tao-nv__error">{errors.ngayBatDau}</span>
            )}
          </div>

          {/* Actions */}
          <div className="modal-tao-nv__actions">
            <button
              type="button"
              className="operator-btn operator-btn--secondary"
              onClick={onClose}
              disabled={taoMutation.isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="operator-btn operator-btn--primary"
              disabled={taoMutation.isLoading}
            >
              {taoMutation.isLoading ? "Đang xử lý..." : "➕ Tạo nhân viên"}
            </button>
          </div>
        </form>
      </div>
    </ModalOperator>
  );
};

export default ModalTaoNhanVien;
