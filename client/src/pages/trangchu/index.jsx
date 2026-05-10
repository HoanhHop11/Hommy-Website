import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "./trangchu.css";
import tinDangPublicApi from "../../api/tinDangPublicApi";
import SearchKhuVuc from "../../components/SearchKhuVuc";
import yeuThichApi from "../../api/yeuThichApi";
import { Link } from "react-router-dom";
import { getStaticUrl } from "../../config/api";
import { useTranslation } from "../../context/LanguageContext";
import ChatBot from "../../components/ChatBot/ChatBot";

function TrangChu() {
  const { t } = useTranslation();
  const [tindangs, setTindangs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingFavId, setAddingFavId] = useState(null);

  useEffect(() => {
    fetchTinDangs();
  }, []);

  // Sử dụng tinDangPublicApi.getAll() để lấy tin đăng công khai
  const fetchTinDangs = async (params = {}) => {
    setLoading(true);
    setError("");
    console.log("[TrangChu] 📞 fetchTinDangs params:", params);
    try {
      const res = await tinDangPublicApi.getAll(params);
      console.log("[TrangChu] 📥 tinDangPublicApi.getAll response:", res);
      console.log("[TrangChu] 📥 response.data:", res?.data);

      // Axios response structure: { data: { success, data }, status, headers }
      let raw = [];
      if (res?.data?.success && Array.isArray(res.data.data)) {
        // Backend trả: { success: true, data: [...] }
        raw = res.data.data;
      } else if (Array.isArray(res?.data)) {
        // Fallback: { data: [...] }
        raw = res.data;
      } else {
        console.warn("[TrangChu] Không nhận diện được cấu trúc response:", res);
        raw = [];
      }

      console.log("[TrangChu] RAW LIST FROM API:", raw);

      setTindangs(raw);
    } catch (err) {
      console.error(
        "Lỗi lấy tin đăng:",
        err?.response?.data || err.message || err
      );
      setError("Không thể tải tin đăng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKhuVuc = (payload = {}) => {
    console.log("[TrangChu] 🔍 handleSearchKhuVuc payload:", payload); // debug
    console.log("[TrangChu] 🔍 payload.KhuVucID:", payload?.KhuVucID);
    console.log("[TrangChu] 🔍 payload.tenKhuVuc:", payload?.tenKhuVuc);
    console.log("[TrangChu] 🔍 payload.path:", payload?.path);
    console.log("[TrangChu] 🔍 payload.keyword:", payload?.keyword);
    
    // Xây dựng params cho API
    const params = {};
    
    // Thêm khu vực nếu có
    if (payload?.KhuVucID) {
      const khuVucId = Number(payload.KhuVucID);
      if (!isNaN(khuVucId) && khuVucId > 0) {
        params.khuVucId = khuVucId;
        console.log("[TrangChu] ✅ Lọc theo KhuVucID:", khuVucId);
      }
    }
    
    // Thêm từ khóa nếu có
    if (payload?.keyword && payload.keyword.trim()) {
      params.keyword = payload.keyword.trim();
      console.log("[TrangChu] ✅ Tìm kiếm theo từ khóa:", params.keyword);
    }
    
    // Gọi API với params (có thể rỗng nếu không có filter nào)
    fetchTinDangs(Object.keys(params).length > 0 ? params : {});
  };

  const formatPrice = (g) => {
    if (!g) return "-";
    const n = Number(g);
    if (isNaN(n)) return g;
    return n.toLocaleString("vi-VN") + " VND";
  };

  const getCurrentUserId = () => {
    try {
      const raw =
        localStorage.getItem("user") || localStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const actual = parsed.user ?? parsed;
        const id = actual?.NguoiDungID ?? actual?.id ?? actual?.userId;
        if (id) return Number(id);
      }
    } catch {
      /* ignore */
    }
    const idKey = localStorage.getItem("userId");
    if (idKey && !isNaN(Number(idKey))) return Number(idKey);
    return null;
  };

  const handleAddFavorite = async (tin) => {
    const tinId = tin?.TinDangID ?? tin?.id ?? tin?._id;
    const userId = getCurrentUserId();
    if (!userId) {
      // redirect to login or show message
      window.location.href = "/login";
      return;
    }
    if (!tinId) return;
    setAddingFavId(tinId);
    try {
      await yeuThichApi.add({ NguoiDungID: userId, TinDangID: tinId });
      // simple feedback
      alert("Đã thêm vào yêu thích");
    } catch (err) {
      console.error("Thêm yêu thích lỗi:", err?.response ?? err);
      alert("Thêm yêu thích thất bại");
    } finally {
      setAddingFavId(null);
    }
  };

  // chuyển hàm ra ngoài JSX, đặt trước return
  const getFirstImage = (tin) => {
    const placeholder = "https://via.placeholder.com/160x110?text=No+Image";
    const raw = tin?.URL ?? tin?.Img ?? tin?.Images ?? tin?.images;
    if (!raw) return placeholder;

    const normalizeList = (input) => {
      if (!input) return [];
      if (Array.isArray(input)) return input;
      if (typeof input === "string") {
        const s = input.trim();
        if (s.startsWith("[") && s.endsWith("]")) {
          try {
            const parsed = JSON.parse(s);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [s];
          }
        }
        return [s];
      }
      return [input];
    };

    const first = normalizeList(raw).find(Boolean);
    if (!first) return placeholder;

    const full = getStaticUrl(first);
    return full || placeholder;
  };

  return (
    <div className="trangchu">
      <Header />
      
      {/* Banner chính full màn hình */}
      <div className="trangchu__banner">
        <div className="trangchu__banner-overlay"></div>
        <div className="trangchu__banner-content">
          <h1 className="trangchu__banner-title">{t('homepage.bannerTitle')}</h1>
          <p className="trangchu__banner-subtitle">{t('homepage.bannerSubtitle')}</p>
        </div>
        
        {/* Search bar ở bottom banner */}
        <div className="trangchu__banner-search">
          <SearchKhuVuc onSearch={handleSearchKhuVuc} />
        </div>
      </div>

      <div className="content">
        <div className="content1">
          <div className="danhsach">
            {loading && <div className="tindang-loading">{t('homepage.loading')}</div>}
            {error && <div className="tindang-error">{error || t('homepage.error')}</div>}

            {!loading && tindangs.length === 0 && (
              <div className="tindang-empty">{t('homepage.noListings')}</div>
            )}

            {tindangs.map((tinDang) => {
              const key = tinDang.TinDangID ?? tinDang.id ?? tinDang._id;
              const imgSrc = getFirstImage(tinDang);

              return (
                <div className="duan" key={key}>
                  <div className="anhduan">
                    <Link to={`/tin-dang/${key}`}>
                      <img src={imgSrc} alt={tinDang.TieuDe} />
                    </Link>
                  </div>
                  <div className="thongtinduan">
                    <div className="tieude">
                      <Link to={`/tin-dang/${key}`}>{tinDang.TieuDe}</Link>
                    </div>
                    <div className="diachi">{t('homepage.address')}: {tinDang.DiaChi ?? "-"}</div>
                    <div className="gia">{formatPrice(tinDang.Gia)}</div>
                    <div className="dientich">
                      {t('homepage.area')}: {tinDang.DienTich ?? "-"} m2
                    </div>
                    {/* <div className="lienhe">Liên hệ: - </div> */}
                    <div className="thoigian">
                      {tinDang.TaoLuc ? new Date(tinDang.TaoLuc).toLocaleString() : ""}
                      <button
                        type="button"
                        className="fav-btn"
                        onClick={() => handleAddFavorite(tinDang)}
                        disabled={addingFavId === key}
                        title={t('homepage.addToFavorites')}
                      >
                        🩶 {addingFavId === key ? "..." : ""}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content2">
          {/* Map riêng biệt */}
          <div className="khuvuc-map">
            <div className="khuvuc-map__title">Bản đồ khu vực</div>
            <div className="khuvuc-map__container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.231407028!2d106.6296639!3d10.8230989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bee0b0ef9e5%3A0x5b4da59e47ee97!2zQ8O0bmcgdmnDqm4gUGjhu5cgVHJv!5e0!3m2!1svi!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('homepage.mapTitle')}
              ></iframe>
            </div>
          </div>

          {/* Box khu vực */}
          <div className="khuvuc">
            <div className="khuvuc-title">
              {t('homepage.areaTitle')}
            </div>
            <ul>
              <li>Quận Gò Vấp (6)</li>
              <li>Quận 2 (3)</li>
              <li>Quận 3 (23)</li>
              <li>Quận 4 (23)</li>
              <li>Quận Bình Thạnh (12)</li>
              <li>Quận 9 (15)</li>
            </ul>
          </div>
          <div className="tintuc">
            <div className="tintuc-title">{t('homepage.newsTitle')}</div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.1a31QUbCZjQD8w2KP2DKnwHaGu?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 2 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse1.mm.bing.net/th/id/OIP.nwpNtC4zPc0jnBd5AULU-gHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 10 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://th.bing.com/th/id/R.e7fbd2d75d40b4a405a283c4deb7bb37?rik=nUrwglwUVlTZgQ&pid=ImgRaw&r=0"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận gò vấp có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
            <div className="tintuc-baiviet">
              <div className="anhduan">
                <img
                  src="https://tse3.mm.bing.net/th/id/OIP.-6ttgevwVQAzlCfmVixTBQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Ảnh dự án"
                />
              </div>
              <div className="thongtinduan">
                <div className="tieude">
                  Cho thuê phòng trọ ngay quận 4 có đủ tiện nghi
                </div>

                <div className="thoigian">Hôm nay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
      <Footer />
    </div>
  );
}
export default TrangChu;
