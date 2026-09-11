/* ==========================================================================
   TOOLS REGISTRY & GUIDES DICTIONARY
   ========================================================================== */

const TOOLS = [
  {
    id:"video-veo3", num:"01", name:"Video khởi động Veo 3",
    kicker:"Video mở bài", title:"Video khởi động bài học (Veo 3)",
    desc:"Tạo hồ sơ nhân vật, storyboard, prompt tạo ảnh và prompt Veo 3 cho video mở đầu bài học, dẫn dắt tự nhiên vào kiến thức mới.",
    system: SYS_VEO3, outputType:"text", filename:"video-veo3.txt",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"bai_hoc", label:"Tên bài học / chủ đề", type:"text", required:true, placeholder:"VD: Giá trị lớn nhất, giá trị nhỏ nhất của hàm số"},
      {key:"so_canh", label:"Số phân cảnh", type:"number", default:5, row:"r1"},
      {key:"ty_le", label:"Tỷ lệ khung hình", type:"select", options:["16:9","9:16"], default:"16:9", row:"r1"},
      {key:"thoi_luong", label:"Thời lượng mỗi cảnh", type:"text", default:"6-8 giây", row:"r1"},
      {key:"nhan_vat", label:"Nhân vật (tên, vai trò, đặc điểm)", type:"textarea", placeholder:"Để trống nếu muốn AI tự đề xuất 2-3 nhân vật phù hợp"},
      {key:"tom_tat", label:"Tóm tắt nội dung / tình huống muốn khai thác", type:"textarea", placeholder:"Mô tả bối cảnh tình huống thực tế hoặc mâu thuẫn nhận thức cần gợi mở"},
      {key:"phong_cach", label:"Phong cách hình ảnh", type:"text", placeholder:"VD: giáo dục hiện đại, hoạt hình 3D Pixar, điện ảnh thực tế...", row:"r2"},
      {key:"chat_giong", label:"Chất giọng nhân vật", type:"text", placeholder:"Để trống để AI tự chọn giọng chuẩn tự nhiên", row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Không dùng bối cảnh quá phức tạp, giữ nguyên 2 nhân vật xuyên suốt, giọng thoại tự nhiên..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn của bài học", type:"textarea", placeholder:"Dán nội dung sách giáo khoa hoặc tài liệu kiến thức cốt lõi vào đây"}
    ],
    buildUser(v){
      let s = `[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 12"}\n[BAI_HOC]=${v.bai_hoc}\n[SO_CANH]=${v.so_canh||5}\n[TY_LE]=${v.ty_le||"16:9"}\n[THOI_LUONG_CANH]=${v.thoi_luong||"6-8 giây"}\n`;
      if(v.nhan_vat) s+=`[NHAN_VAT]=${v.nhan_vat}\n`;
      if(v.tom_tat) s+=`[TOM_TAT]=${v.tom_tat}\n`;
      if(v.phong_cach) s+=`[PHONG_CACH]=${v.phong_cach}\n`;
      if(v.chat_giong) s+=`[CHAT_GIONG]=${v.chat_giong}\n`;
      if(v.rang_buoc) s+=`[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"phieu-hoc-tap", num:"02", name:"Phiếu học tập",
    kicker:"Infographic", title:"Tạo phiếu học tập",
    desc:"Sinh prompt JSON để tạo infographic phiếu học tập gồm 5 dạng câu hỏi: điền khuyết, ghép đôi, đúng-sai, trắc nghiệm, tự luận.",
    system: SYS_PHIEUHOCTAP, outputType:"json", filename:"phieu-hoc-tap.json",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"chude", label:"Tên bài học / chủ đề", type:"text", required:true, placeholder:"VD: Khảo sát sự biến thiên và vẽ đồ thị hàm số"},
      {key:"mau_trinh_bay", label:"🎨 Mẫu trình bày / Layout thiết kế (Theo môn & lứa tuổi)", type:"select", options:[
        "✨ Tự động tối ưu theo Môn & Lứa tuổi",
        "🐣 Tiểu học: Pastel Hoạt hình & Sticker ngộ nghĩnh",
        "🚀 THCS: Trạm thử thách Gamification (Mission Stations)",
        "📊 THPT: Infographic Cornell Note tối giản & Hiện đại",
        "🧪 STEM & Khoa học: Nhật ký thí nghiệm Lab Worksheet",
        "📜 Xã hội & Văn học: Timeline & Sơ đồ tư duy Vintage",
        "🇬🇧 Tiếng Anh / Song ngữ: Flashcard Comic & Dual Column"
      ], default:"✨ Tự động tối ưu theo Môn & Lứa tuổi", row:"r1"},
      {key:"phongcach", label:"Phong cách thiết kế bổ sung", type:"text", default:"hiện đại giáo dục, nhiều hình minh hoạ", row:"r1"},
      {key:"loigiai", label:"Kèm đáp án / lời giải?", type:"select", options:["TẮT","BẬT"], default:"TẮT", row:"r2"},
      {key:"tile", label:"Tỉ lệ khung hình", type:"select", options:["9:16","3:4","16:9"], default:"9:16", row:"r2"},
      {key:"dienkhuyet", label:"Trạm 1: Điền khuyết (Số câu)", type:"number", default:2, row:"r3"},
      {key:"ghepdoi", label:"Trạm 2: Ghép đôi (Số câu)", type:"number", default:2, row:"r3"},
      {key:"dungsai", label:"Trạm 3: Đúng/Sai (Số câu)", type:"number", default:2, row:"r3"},
      {key:"tracnghiem", label:"Trạm 4: Trắc nghiệm (Số câu)", type:"number", default:2, row:"r3"},
      {key:"tuluan", label:"Trạm 5: Tự luận (Số câu)", type:"number", default:2, row:"r3"},
      {key:"doituong", label:"Đối tượng học sinh / Ghi chú thêm", type:"text", placeholder:"VD: Học sinh khá giỏi THPT, Lớp chuyên..."},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Trắc nghiệm bắt buộc 4 lựa chọn A,B,C,D, không bịa đáp án ngoài bài học, công thức toán/khoa học chuẩn LaTeX..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn của bài học", type:"textarea"}
    ],
    buildUser(v){
      let s = `[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 12"}\n[CHUDE]=${v.chude}\n[MAU_TRINH_BAY]=${v.mau_trinh_bay||"Tự động tối ưu"}\n[PHONGCACH]=${v.phongcach||"hiện đại giáo dục"}\n[LOI_GIAI]=${v.loigiai||"TẮT"}\n[TI_LE]=${v.tile||"9:16"}\n`+
        `[DIEN_KHUYET]=${v.dienkhuyet}\n[GHEP_DOI]=${v.ghepdoi}\n[DUNG_SAI]=${v.dungsai}\n[TRAC_NGHIEM]=${v.tracnghiem}\n[TU_LUAN]=${v.tuluan}\n`;
      if(v.doituong) s+=`[DOI_TUONG]=${v.doituong}\n`;
      if(v.rang_buoc) s+=`[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"mindmap", num:"03", name:"Sơ đồ tư duy / Infographic",
    kicker:"Tóm tắt bài học", title:"Sơ đồ tư duy & Infographic",
    desc:"Tóm tắt toàn bộ bài học thành một infographic kết hợp sơ đồ tư duy (mindmap), khổ A4, phong cách retro.",
    system: SYS_MINDMAP, outputType:"json", filename:"mindmap.json",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"bai", label:"Số thứ tự và tên bài học", type:"text", required:true, placeholder:"VD: Bài 1. Giá trị lớn nhất, giá trị nhỏ nhất của hàm số"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Giới hạn tối đa 4 nhánh chính, màu sắc retro nhã nhặn, công thức chuẩn LaTeX..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn của bài học", type:"textarea", placeholder:"Dán nội dung lý thuyết bài học cần tóm tắt sơ đồ"}
    ],
    buildUser(v){
      let s = `[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 12"}\n[BAI]\n${v.bai}`;
      if(v.rang_buoc) s+=`\n[RANG_BUOC]=${v.rang_buoc}`;
      if(v.nguon) s+=`\n\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"geogebra", num:"04", name:"GeoGebra & NotebookLM",
    kicker:"Dựng hình", title:"Script GeoGebra",
    desc:"Chuyển mô tả hình học tự nhiên thành script GeoGebra 2D/3D, sẵn sàng copy dán vào GeoGebra.",
    system: SYS_GEOGEBRA, outputType:"text", filename:"geogebra-script.txt",
    fields:[
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"yeucau", label:"Yêu cầu dựng hình", type:"textarea", required:true, placeholder:"VD: Vẽ hình chóp S.ABCD, đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy (ABCD). SA = a*sqrt(3). Vẽ đường cao AH của tam giác SAB."},
      {key:"dim", label:"Không gian", type:"select", options:["Tự động","2D","3D"], default:"Tự động", row:"r1"},
      {key:"phuongphap", label:"Phương pháp dựng", type:"select", options:["Tự động","Ưu tiên tọa độ","Ưu tiên quan hệ hình học"], default:"Tự động", row:"r1"},
      {key:"label", label:"Hiện nhãn điểm chính", type:"checkbox", default:true, row:"r2"},
      {key:"anphu", label:"Ẩn đối tượng dựng phụ", type:"checkbox", default:false, row:"r2"},
      {key:"mau", label:"Phân màu trực quan", type:"checkbox", default:true, row:"r2"},
      {key:"chiscript", label:"Chỉ xuất code (không giải thích)", type:"checkbox", default:true, row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Bắt buộc dùng cú pháp lệnh GeoGebra chuẩn, không dùng tọa độ suy biến, tô màu mặt phẳng đáy..."}
    ],
    buildUser(v){
      let flags=[];
      if(v.dim==="2D") flags.push("[2D]"); if(v.dim==="3D") flags.push("[3D]");
      if(v.phuongphap==="Ưu tiên tọa độ") flags.push("[TOADO]");
      if(v.phuongphap==="Ưu tiên quan hệ hình học") flags.push("[HINHHOC]");
      if(v.label) flags.push("[LABEL]");
      if(v.anphu) flags.push("[ANPHU]");
      if(v.mau) flags.push("[MAU]");
      if(v.chiscript) flags.push("[SCRIPT]");
      let s = `[LOP]=${v.lop||"Lớp 12"}\n${flags.join(" ")} ${v.yeucau}`.trim();
      if(v.rang_buoc) s+=`\n[RANG_BUOC]=${v.rang_buoc}`;
      return s;
    }
  },
  {
    id:"de-22-cau", num:"05", name:"Đề kiểm tra chuẩn CV 7991",
    kicker:"Đề kiểm tra", title:"Đề kiểm tra chuẩn Công văn 7991 (22 câu / Linh hoạt)",
    desc:"Biên soạn đề kiểm tra chuẩn thể thức Bộ GD&ĐT bám sát Công văn số 7991/BGDĐT-GDTrH: Tiêu đề hành chính chuẩn (bỏ quốc hiệu), hỗ trợ linh hoạt 3 phần trắc nghiệm + tự luận, ma trận nhận thức và hướng dẫn chấm barem điểm chi tiết.",
    system: SYS_DETHI22, outputType:"json", filename:"de-thi-cv7991.json",
    fields:[
      {key:"ten_so", label:"Tên Sở GD&ĐT / Đơn vị quản lý", type:"text", default:"SỞ GIÁO DỤC VÀ ĐÀO TẠO", placeholder:"VD: SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI", row:"hdr1"},
      {key:"ten_truong", label:"Tên Trường THPT / Tổ bộ môn", type:"text", default:"TRƯỜNG THPT CHUYÊN ...........................", placeholder:"VD: TRƯỜNG THPT CHUYÊN ...", row:"hdr1"},
      {key:"ma_de", label:"Mã đề thi", type:"text", default:"101", placeholder:"VD: 101, 102...", row:"hdr2"},
      {key:"nam_hoc", label:"Năm học", type:"text", default:"2025 - 2026", placeholder:"VD: 2025 - 2026", row:"hdr2"},
      {key:"thoi_gian", label:"Thời gian làm bài", type:"text", default:"90 phút", placeholder:"VD: 90 phút, 50 phút, 45 phút", row:"hdr2"},
      {key:"tieude", label:"Tên bài kiểm tra / Kỳ thi", type:"text", default:"BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I", placeholder:"VD: BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I / ĐỀ KIỂM TRA GIỮA KỲ", row:"hdr3"},
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"hdr3"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"hdr3"},
      {key:"mau_de", label:"Mẫu cấu trúc đề (theo Công văn 7991/BGDĐT-GDTrH)", type:"select", options:[
        "Chuẩn CV 7991 - 22 câu Trắc nghiệm (Toán THPT: 12 TN + 4 Đ/S + 6 TLN - 90 phút)",
        "Chuẩn CV 7991 - 28 câu Trắc nghiệm (KHTN: Vật lí/Hóa học/Sinh học/Địa lí: 18 TN + 4 Đ/S + 6 TLN - 50 phút)",
        "Chuẩn CV 7991 - Kết hợp Trắc nghiệm & Tự luận (70% TN: 12 TN + 2 Đ/S + 2 TLN; 30% Tự luận: 2 câu)",
        "Kiểm tra thường xuyên / 45 phút (8 TN + 2 Đ/S + 2 TLN)",
        "Tùy chỉnh số câu linh hoạt"
      ], default:"Chuẩn CV 7991 - 22 câu Trắc nghiệm (Toán THPT: 12 TN + 4 Đ/S + 6 TLN - 90 phút)"},
      {key:"p1", label:"Phần I: TN 4 lựa chọn", type:"number", default:12, row:"cnt1"},
      {key:"p2", label:"Phần II: Đúng - Sai", type:"number", default:4, row:"cnt1"},
      {key:"p3", label:"Phần III: Trả lời ngắn", type:"number", default:6, row:"cnt1"},
      {key:"p4", label:"Phần IV: Tự luận (câu)", type:"number", default:0, row:"cnt1"},
      {key:"muc_do", label:"Tỉ lệ Ma trận nhận thức (theo CV 7991)", type:"select", options:[
        "Chuẩn định kỳ phân hóa (40% NB - 30% TH - 20% VD - 10% VDC)",
        "Kiểm tra cơ bản (50% NB - 30% TH - 20% VD - 0% VDC)",
        "Khảo sát chất lượng / Thi thử (30% NB - 35% TH - 25% VD - 10% VDC)",
        "Tùy chỉnh phân bổ theo tài liệu nguồn"
      ], default:"Chuẩn định kỳ phân hóa (40% NB - 30% TH - 20% VD - 10% VDC)"},
      {key:"chude", label:"Chủ đề / Chương / Giới hạn kiến thức", type:"textarea", required:true, placeholder:"VD:\nChương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số\nChương 2: Tọa độ trong không gian"},
      {key:"che_do_dap_an", label:"Chế độ tạo Đáp án & Hướng dẫn chấm", type:"select", options:[
        "Đầy đủ: Bảng đáp án nhanh + Lời giải chi tiết + Barem điểm chuẩn CV 7991",
        "Bảng đáp án nhanh + Đáp số",
        "Chỉ xuất đề bài (không tạo đáp án)"
      ], default:"Đầy đủ: Bảng đáp án nhanh + Lời giải chi tiết + Barem điểm chuẩn CV 7991"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn bổ sung", type:"textarea", placeholder:"VD: Đánh số lại từ Câu 1 sau mỗi phần, công thức Toán đặt trong $...$, bài toán thực tế có ngữ cảnh rõ ràng, hình vẽ có code TikZ..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn đính kèm (nếu có)", type:"textarea"}
    ],
    buildUser(v){
      let s = `[TEN_SO]=${v.ten_so||"SỞ GIÁO DỤC VÀ ĐÀO TẠO"}\n[TEN_TRUONG]=${v.ten_truong||"TRƯỜNG THPT CHUYÊN ..........................."}\n`;
      s+= `[MA_DE]=${v.ma_de||"101"}\n[NAM_HOC]=${v.nam_hoc||"2025 - 2026"}\n[THOI_GIAN]=${v.thoi_gian||"90 phút"}\n`;
      s+= `[TIEUDE]=${v.tieude||"BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I"}\n[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 12"}\n`;
      s+= `[MAU_DE]=${v.mau_de||"Chuẩn CV 7991 - 22 câu Trắc nghiệm"}\n`;
      s+= `[SO_CAU_P1]=${v.p1||12}\n[SO_CAU_P2]=${v.p2||4}\n[SO_CAU_P3]=${v.p3||6}\n[SO_CAU_P4]=${v.p4||0}\n`;
      s+= `[MUC_DO]=${v.muc_do||"40% NB - 30% TH - 20% VD - 10% VDC"}\n`;
      s+= `[CHE_DO_DAP_AN]=${v.che_do_dap_an||"Đầy đủ"}\n`;
      s+= `[CHUDE]=\n${v.chude}\n`;
      if(v.rang_buoc) s+= `[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.nguon) s+= `\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"toan-thuc-te", num:"06", name:"Bài tập thực tế",
    kicker:"Vận dụng thực tế", title:"Bài tập thực tế / Vận dụng đời sống (KNTT + MATH FIGURE LOCK)",
    desc:"Biên soạn tập đề bài thực tế chuẩn SGK Kết nối tri thức hoặc Infographic 3 cột (Đề bài - Hình minh họa TikZ/Art Layer - Bài làm/Lời giải) khóa chặt quy tắc Math Layer & Art Layer, hỗ trợ phong cách Sketchnote mực xanh chủ đạo, chế độ Học sinh (dòng kẻ nét) và Giáo viên (lời giải chi tiết).",
    outputType:"auto", filename:"bai-tap-thuc-te.txt",
    fields:[
      {key:"mode", label:"Bạn muốn tạo dạng gì?", type:"select", options:["Infographic minh họa 3 cột (JSON)","Đề bài thực tế (văn bản)"], default:"Infographic minh họa 3 cột (JSON)"},
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 10", row:"r0"},
      {key:"chude", label:"Chủ đề / chương", type:"text", required:true, placeholder:"VD: Hệ thức lượng trong tam giác / Đo đạc thực địa", row:"r1"},
      {key:"socau", label:"Số lượng câu hỏi", type:"number", default:4, row:"r1"},
      {key:"chedo", label:"Chế độ trình bày Cột thứ 3 (Bật/Tắt lời giải)", type:"select", options:[
        "Học sinh (Cột 3 chừa dòng kẻ làm bài, không lời giải)",
        "Giáo viên (Cột 3 có lời giải chi tiết & đáp số)"
      ], default:"Học sinh (Cột 3 chừa dòng kẻ làm bài, không lời giải)", row:"r2"},
      {key:"phongcach", label:"Phong cách thiết kế Infographic", type:"select", options:[
        "Sketchnote, viết mực màu xanh làm chủ đạo (Bản vẽ tay, đường nét mềm, xanh dương chủ đạo)",
        "Giáo dục hiện đại (Modern Vector Infographic, sắc nét)",
        "Bản vẽ kỹ thuật Blueprint (Tối giản, mực kỹ thuật)",
        "Tối giản đen trắng (Minimalist Print)"
      ], default:"Sketchnote, viết mực màu xanh làm chủ đạo (Bản vẽ tay, đường nét mềm, xanh dương chủ đạo)", row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Khóa chặt Math Layer & Art Layer, bám sát SGK Kết nối tri thức, bố cục 3 khung mỗi khung 1 bài, tỷ lệ 3:4 khổ giấy in..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn", type:"textarea", placeholder:"Dán bài toán gốc, số liệu đo đạc thực địa hoặc nội dung SGK cần bám sát"}
    ],
    system(v){ return (v.mode && v.mode.startsWith("Đề bài")) ? sysToanThucTeDeBai(v) : sysToanThucTeInfographic(v); },
    outputTypeFor(v){ return (v.mode && v.mode.startsWith("Đề bài")) ? "text" : "json"; },
    filenameFor(v){ return (v.mode && v.mode.startsWith("Đề bài")) ? "bai-tap-thuc-te.txt" : "bai-tap-thuc-te.json"; },
    buildUser(v){
      const soCau = v.socau || 5;
      let s = `[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 10"}\n[CHU_DE]=${v.chude}\n[SO_CAU]=${soCau}\n[CHE_DO]=${v.chedo||"Học sinh (Cột 3 chừa dòng kẻ làm bài, không lời giải)"}\n[PHONG_CACH]=${v.phongcach||"Sketchnote, viết mực màu xanh làm chủ đạo"}\n[BO_SACH]=Kết nối tri thức với cuộc sống\n`;
      s += `\n⚠️ BẮT BUỘC VỀ SỐ LƯỢNG: Phải biên soạn ĐỦ ĐÚNG ${soCau} BÀI TOÁN KHÁC NHAU (từ Câu 1 đến Câu ${soCau}). Tuyệt đối KHÔNG chỉ tạo 1 câu mẫu, không dừng lại ở Câu 1.\n`;
      if(v.rang_buoc) s+=`[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"truyen-tranh", num:"07", name:"Truyện tranh tích hợp bài học",
    kicker:"Truyện tranh", title:"Truyện tranh tích hợp bài học",
    desc:"Tạo các phân cảnh truyện tranh lồng ghép nội dung bài học theo phong cách nhân vật quen thuộc với học sinh.",
    system: SYS_TRUYENTRANH, outputType:"text", filename:"truyen-tranh.txt",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"phongcach", label:"Phong cách nhân vật", type:"select", required:true, options:[
        "Doraemon (Doraemon, Nobita, Xuka, Chaien, Xeko)",
        "Hãy đợi đấy (Sói, Thỏ, Lợn, Gà trống, Khỉ, Voi)",
        "Tom and Jerry (Tom, Jerry, Spike, Tyke, Toodles Galore, Butch)",
        "Truyện tranh Việt Nam",
        "Bộ đội Việt Nam",
        "Nàng tiên cá",
        "Sketchnote văn học"
      ], row:"r1"},
      {key:"socanh", label:"Số cảnh truyện", type:"number", default:4, row:"r1"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Nhân vật không nói triết lý dài dòng, tình huống hài hước ngắn gọn, màu sắc tươi sáng..."},
      {key:"noidung", label:"Nội dung bài học cần lồng ghép", type:"textarea", required:true, placeholder:"VD: Quy tắc cộng xác suất và quy tắc nhân xác suất qua câu chuyện Nobita chơi trò chơi xúc xắc cùng Doraemon"}
    ],
    buildUser(v){
      let s = `[MON]=${v.mon||"Toán"}\n[LOP]=${v.lop||"Lớp 12"}\n[PHONG_CACH]=${v.phongcach}\n[SO_CANH]=${v.socanh||4}\n`;
      if(v.rang_buoc) s+=`[RANG_BUOC]=${v.rang_buoc}\n`;
      s+=`\nNội dung bài học:\n${v.noidung}`;
      return s;
    }
  },
  {
    id:"game-quiz", num:"08", name:"Game tích hợp bài học",
    kicker:"Quiz tương tác", title:"Game / Quiz tương tác (File HTML)",
    desc:"Tạo một file HTML quiz trắc nghiệm tương tác hoàn chỉnh, tự động chấm điểm và phân tích năng lực học sinh.",
    system: SYS_QUIZGAME, outputType:"html", filename:"quiz.html",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"bai", label:"Tên bài học / chủ đề", type:"text", required:true, placeholder:"VD: Phương trình mặt phẳng trong không gian Oxyz"},
      {key:"socau", label:"Số câu hỏi", type:"number", default:10, row:"r1"},
      {key:"mucdo", label:"Mức độ", type:"select", options:["Hỗn hợp","Dễ","Trung bình","Khó"], default:"Hỗn hợp", row:"r1"},
      {key:"loaicauhoi", label:"Loại câu hỏi", type:"select", options:["Hỗn hợp","Một đáp án đúng","Nhiều đáp án đúng","Đúng sai"], default:"Hỗn hợp", row:"r1"},
      {key:"phongcach", label:"Phong cách giao diện", type:"text", default:"hiện đại, thân thiện, màu xanh dương", row:"r2"},
      {key:"doituong", label:"Đối tượng học sinh / Ghi chú thêm", type:"text", default:"học sinh THPT", row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Bắt buộc chèn thẻ script MathJax v3, 100% tiếng Việt, có thanh tiến trình và hiệu ứng chuyển câu..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn", type:"textarea"}
    ],
    buildUser(v){
      let s = `[BÀI]=${v.bai}\n[MÔN]=${v.mon||"Toán"}\n[LỚP]=${v.lop||"Lớp 12"}\n[SỐ CÂU]=${v.socau||10}\n[PHONG CÁCH]=${v.phongcach||"hiện đại"}\n[ĐỐI TƯỢNG]=${v.doituong||"học sinh THPT"}\n[MỨC ĐỘ]=${v.mucdo||"Hỗn hợp"}\n[LOẠI CÂU HỎI]=${v.loaicauhoi||"Hỗn hợp"}\n`;
      if(v.rang_buoc) s+=`[RÀNG_BUỘC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"mail-ao", num:"09", name:"Tạo tài khoản AI an toàn",
    kicker:"Hướng dẫn an toàn", title:"Hướng dẫn tạo nhiều tài khoản AI (ChatGPT / Gemini) an toàn & miễn phí",
    desc:"Phương pháp tạo nhiều tài khoản thử nghiệm sử dụng Gmail Alias an toàn 100%, không bị dính link quảng cáo độc hại và không lo lộ thông tin cá nhân.",
    isInfo:true
  },
  {
    id:"toan-tieng-anh-clil", num:"10", name:"Dạy học song ngữ (CLIL)",
    kicker:"Dạy học song ngữ", title:"Dạy học Song ngữ & Giáo án CLIL",
    desc:"Tạo prompt bài học từ vựng, cách đọc công thức chuẩn bản ngữ, mẫu câu giao tiếp lớp học và giáo án song ngữ CLIL (Tiếng Anh là ngôn ngữ thứ 2).",
    system: SYS_CLIL,
    outputType: "auto",
    outputTypeFor(v){
      return (v.mode && v.mode.includes("Infographic")) ? "json" : "text";
    },
    filenameFor(v){
      return (v.mode && v.mode.includes("Infographic")) ? "clil-flashcard.json" :
             (v.mode && v.mode.includes("Giáo án")) ? "giao-an-clil.txt" : "clil-bai-hoc.txt";
    },
    fields:[
      {key:"mode", label:"Dạng bài sản xuất", type:"select", options:[
        "1. Bài học Từ vựng & Mẫu câu (Text/Văn bản)",
        "2. Kế hoạch bài dạy / Giáo án CLIL 4C (Văn bản)",
        "3. Infographic / Flashcard Từ vựng & Công thức (JSON)"
      ], default:"1. Bài học Từ vựng & Mẫu câu (Text/Văn bản)"},
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp / Cấp học", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"chude", label:"Tên bài học / Chủ đề", type:"text", required:true, placeholder:"VD: Đạo hàm và ứng dụng / Quadratic Functions / Vector in Space / Photosynthesis"},
      {key:"trinhdo", label:"Trình độ Tiếng Anh học sinh", type:"select", options:["Cơ bản (A1-A2)","Trung bình (B1)","Nâng cao (B2+)"], default:"Trung bình (B1)", row:"r1"},
      {key:"sotu", label:"Số từ vựng trọng tâm", type:"number", default:8, row:"r1"},
      {key:"doc_cong_thuc", label:"Kèm hướng dẫn đọc công thức bằng tiếng Anh?", type:"checkbox", default:true, row:"r2"},
      {key:"mau_cau_lop", label:"Kèm mẫu câu giao tiếp lớp học cho GV?", type:"checkbox", default:true, row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Dùng thuật ngữ Anh-Mỹ chuẩn xác, IPA chuẩn, câu ví dụ dễ hiểu..."},
      {key:"nguon", label:"Nội dung / tài liệu nguồn của bài học", type:"textarea", placeholder:"Dán nội dung sách giáo khoa hoặc tài liệu chuyên môn cần biên soạn song ngữ"}
    ],
    buildUser(v){
      let s = `[DẠNG BÀI]=${v.mode||"1. Bài học Từ vựng & Mẫu câu"}\n[MÔN]=${v.mon||"Toán"}\n[CHỦ ĐỀ]=${v.chude}\n[LỚP]=${v.lop||"Lớp 12"}\n[TRÌNH ĐỘ]=${v.trinhdo||"Trung bình (B1)"}\n[SỐ TỪ VỰNG]=${v.sotu||8}\n[DOC_CONG_THUC]=${v.doc_cong_thuc?"BẬT":"TẮT"}\n[MAU_CAU_LOP]=${v.mau_cau_lop?"BẬT":"TẮT"}\n`;
      if(v.rang_buoc) s+=`[RÀNG_BUỘC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nTài liệu nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"tao-nhan-vat", num:"11", name:"Tạo & Khóa nhân vật đồng nhất",
    kicker:"Đồng nhất nhân vật", title:"Tạo & Khóa nhân vật đồng nhất (Video/Ảnh)",
    desc:"Thiết lập Hồ sơ khóa nhân vật (Character Lock Profile) và bộ prompt tham chiếu cố định để tạo video/ảnh với nhân vật đồng nhất 100% qua mọi phân cảnh.",
    system: SYS_TAONHANVAT, outputType:"text", filename:"ho-so-nhan-vat.txt",
    fields:[
      {key:"ten_nv", label:"Tên nhân vật / Vai trò", type:"text", required:true, placeholder:"VD: Thầy Hùng Toán, Nobita, Cô Lan Anh, Bé Minh..."},
      {key:"tuoi_gt", label:"Độ tuổi & Giới tính", type:"text", placeholder:"VD: Nam, khoảng 35 tuổi", row:"r1"},
      {key:"phong_cach", label:"Phong cách nghệ thuật", type:"select", options:[
        "Hoạt hình 3D Pixar / Disney",
        "Điện ảnh chân thực (Cinematic Realistic)",
        "Anime Nhật Bản",
        "Truyện tranh 2D Việt Nam",
        "Sketchnote giáo dục"
      ], default:"Hoạt hình 3D Pixar / Disney", row:"r1"},
      {key:"ngoai_hinh", label:"Ngoại hình & Khuôn mặt cố định", type:"textarea", placeholder:"VD: Mặt tròn phúc hậu, đeo kính gọng đen tròn, tóc ngắn rẽ ngôi 7/3 màu đen, nụ cười thân thiện"},
      {key:"trang_phuc", label:"Trang phục & Phụ kiện cố định", type:"textarea", placeholder:"VD: Áo sơ mi xanh dương nhạt xắn tay áo, quần tây đen, đồng hồ đeo tay dây da nâu"},
      {key:"tinh_cach", label:"Tính cách, Biểu cảm & Giọng nói", type:"text", placeholder:"VD: Hào hứng, kiên nhẫn, giọng nam miền Bắc ấm áp, truyền cảm", row:"r2"},
      {key:"boi_canh", label:"Bối cảnh / Môi trường hay xuất hiện", type:"text", placeholder:"VD: Phòng học hiện đại, bảng xanh, phòng lab khoa học", row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Không thay đổi màu sắc trang phục nhận diện, giọng thoại chuẩn miền Bắc, kính gọng đen tròn..."},
      {key:"ghi_chu", label:"Yêu cầu bổ sung", type:"textarea", placeholder:"VD: Nhân vật cần có cầm phấn hoặc laptop, ánh sáng tự nhiên tươi sáng"}
    ],
    buildUser(v){
      let s = `[TEN_NHAN_VAT]=${v.ten_nv}\n[TUOI_GIOI_TINH]=${v.tuoi_gt||"Tự đề xuất"}\n[PHONG_CACH]=${v.phong_cach||"Hoạt hình 3D Pixar"}\n`;
      if(v.ngoai_hinh) s+=`[NGOAI_HINH]=${v.ngoai_hinh}\n`;
      if(v.trang_phuc) s+=`[TRANG_PHUC]=${v.trang_phuc}\n`;
      if(v.tinh_cach) s+=`[TINH_CACH_GIONG_NOI]=${v.tinh_cach}\n`;
      if(v.boi_canh) s+=`[BOI_CANH]=${v.boi_canh}\n`;
      if(v.rang_buoc) s+=`[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.ghi_chu) s+=`[YEU_CAU_BO_SUNG]=${v.ghi_chu}\n`;
      return s;
    }
  },
  {
    id:"kiem-soat-prompt", num:"12", name:"Kiểm soát & Sửa lỗi Prompt",
    kicker:"Kiểm định & Tối ưu", title:"Kiểm soát tính chính xác & Sửa lỗi Prompt (Ảnh/Video)",
    desc:"Phân tích điểm chính xác của prompt, phát hiện nguyên nhân gây lỗi (đặc biệt là hình ảnh thiếu chính xác, biến dạng) và tự động xuất prompt đã khắc phục tối ưu.",
    system: SYS_KIEMSOATPROMPT, outputType:"text", filename:"prompt-da-sua.txt",
    fields:[
      {key:"prompt_goc", label:"Prompt cần kiểm tra / sửa lỗi", type:"textarea", required:true, placeholder:"Dán prompt hình ảnh hoặc video bạn đã tạo vào đây..."},
      {key:"loai_prompt", label:"Loại Prompt", type:"select", options:[
        "Prompt tạo hình ảnh (Midjourney/Flux/Ideogram/DALL-E)",
        "Prompt tạo video (Google Veo 3/Sora/Kling/Runway)",
        "Prompt JSON Infographic / Phiếu học tập",
        "Prompt Game / Quiz HTML"
      ], default:"Prompt tạo hình ảnh (Midjourney/Flux/Ideogram/DALL-E)", row:"r1"},
      {key:"cong_cu_ai", label:"Công cụ AI sử dụng", type:"select", options:[
        "Google Veo 3 / VideoFX",
        "Midjourney v6",
        "Flux.1 / Ideogram",
        "DALL-E 3 / ChatGPT",
        "Khác"
      ], default:"Midjourney v6", row:"r1"},
      {key:"mo_ta_loi", label:"Mô tả lỗi hoặc điểm chưa chính xác gặp phải", type:"textarea", required:true, placeholder:"VD: Ảnh sinh ra tay bị thừa ngón, nét mặt bị mờ, sai tỷ lệ, nhân vật không giống mô tả, công thức bị méo..."},
      {key:"mong_muon", label:"Yêu cầu kết quả mong muốn sau khi sửa", type:"textarea", placeholder:"VD: Nhân vật rõ nét mặt, đúng góc camera toàn cảnh, phông nền lớp học sạch sẽ, không có chữ lung tung"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn (để Prompt khởi tạo chính xác)", type:"textarea", placeholder:"VD: Bắt buộc có cờ negative prompts loại bỏ méo tay/mờ mặt, giữ nguyên góc camera toàn cảnh..."}
    ],
    buildUser(v){
      let s = `[LOAI_PROMPT]=${v.loai_prompt||"Tạo hình ảnh"}\n[CONG_CU_AI]=${v.cong_cu_ai||"Midjourney v6"}\n\n[PROMPT_GOC]:\n${v.prompt_goc}\n\n[MO_TA_LOI]:\n${v.mo_ta_loi}\n`;
      if(v.mong_muon) s+=`\n[YEU_CAU_MONG_MUON]:\n${v.mong_muon}`;
      if(v.rang_buoc) s+=`\n[RANG_BUOC]=${v.rang_buoc}`;
      return s;
    }
  },
  {
    id:"giai-de-dap-an", num:"13", name:"Giải đề & Làm đáp án chi tiết",
    kicker:"Giải đề & Đáp án", title:"Giải đề & Lập đáp án chi tiết (Text / File / Ảnh <= 4 trang A4)",
    desc:"Đóng vai chuyên gia ra đề & giải đề, tự động phân tích và lập lời giải chi tiết, bảng đáp án nhanh, thang điểm và phân tích cạm bẫy lỗi sai từ file đề (.docx, .pdf, ảnh) hoặc đề bài đã tạo.",
    system: SYS_GIAIDE, outputType:"text", filename:"dap-an-loi-giai.txt",
    fields:[
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"khoi_lop", label:"Khối lớp / Cấp học", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"tieu_de_de", label:"Tên đề thi / Tiêu đề bài kiểm tra", type:"text", required:true, placeholder:"VD: Đề kiểm tra Giữa học kỳ 1 Môn Vật lý Lớp 10 - Mã đề 101", row:"r1"},
      {key:"loai_de", label:"Dạng đề / Cấu trúc đề", type:"select", options:[
        "Đề hỗn hợp 22 câu (12 TN + 4 Đ/S + 6 TLN)",
        "Đề trắc nghiệm 40-50 câu",
        "Đề thi tự luận",
        "Đề bài thực tế / Infographic",
        "Đề tổng hợp / Khác"
      ], default:"Đề hỗn hợp 22 câu (12 TN + 4 Đ/S + 6 TLN)", row:"r1"},
      {key:"kem_dap_an_nhanh", label:"Kèm Bảng đáp án nhanh?", type:"checkbox", default:true, row:"r2"},
      {key:"kem_loi_giai_ct", label:"Kèm Lời giải chi tiết từng bước?", type:"checkbox", default:true, row:"r2"},
      {key:"kem_thang_diem", label:"Kèm Thang điểm & Ma trận?", type:"checkbox", default:true, row:"r2"},
      {key:"kem_cam_bay", label:"Phân tích cạm bẫy & lỗi sai?", type:"checkbox", default:true, row:"r2"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn khi giải đề", type:"textarea", placeholder:"VD: Giải theo phương pháp tự luận ngắn gọn, viết công thức dạng LaTeX, chỉ ra 2 cách giải nếu có..."},
      {key:"nguon", label:"Nội dung đề bài (Dán văn bản đề hoặc trích xuất từ File/Ảnh đính kèm ở trên)", type:"textarea", placeholder:"Dán toàn bộ nội dung câu hỏi/đề thi cần làm đáp án vào đây (hoặc dùng khung Đính kèm tài liệu nguồn ở trên để trích xuất từ file .docx, .pdf, ảnh <= 4 trang A4)"}
    ],
    buildUser(v){
      let s = `[TÊN_ĐỀ]=${v.tieu_de_de}\n[MÔN]=${v.mon||"Toán"}\n[DẠNG_ĐỀ]=${v.loai_de}\n[KHỐI_LỚP]=${v.khoi_lop||"Lớp 12"}\n`;
      s+= `[BẢNG_ĐÁP_ÁN_NHANH]=${v.kem_dap_an_nhanh?"CÓ":"KHÔNG"}\n`;
      s+= `[LỜI_GIẢI_CHI_TIẾT]=${v.kem_loi_giai_ct?"CÓ":"KHÔNG"}\n`;
      s+= `[THANG_ĐIỂM]=${v.kem_thang_diem?"CÓ":"KHÔNG"}\n`;
      s+= `[PHÂN_TÍCH_CẠM_BẪY]=${v.kem_cam_bay?"CÓ":"KHÔNG"}\n`;
      if(v.rang_buoc) s+= `[RÀNG_BUỘC]=${v.rang_buoc}\n`;
      if(v.nguon) s+= `\nNỘI DUNG ĐỀ BÀI CẦN LÀM ĐÁP ÁN:\n\"\"\"\n${v.nguon}\n\"\"\"\n`;
      return s;
    }
  },
  {
    id:"tikz-expert", num:"14", name:"Chuyên gia vẽ hình TikZ",
    kicker:"Vẽ hình LaTeX / TikZ", title:"AI TikZ Code Expert - Vẽ & Sửa mã TikZ",
    desc:"Chuyên gia tái tạo hình học phẳng/không gian, đồ thị hàm số, bảng biến thiên (tkz-tab) và vectơ thành mã TikZ/LaTeX chuẩn toán học.",
    system: SYS_TIKZ_EXPERT, outputType:"text", filename:"tikz-code.tex",
    fields:[
      {key:"yeucau", label:"Mô tả hình cần vẽ / Sửa mã TikZ", type:"textarea", required:true, placeholder:"VD: Vẽ hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với đáy. Hoặc dán code TikZ bị lỗi vào đây..."},
      {key:"cmd", label:"Lệnh chức năng (Optional Command)", type:"select", options:[
        "[TIKZ] Tự động nhận dạng loại hình & sinh code",
        "[BBT] Vẽ bảng biến thiên bằng tkz-tab",
        "[DOTHI] Vẽ hệ trục, đồ thị hàm số & tiệm cận",
        "[HINHHOC] Vẽ hình học phẳng hoặc không gian",
        "[VECTOR] Vẽ vectơ & hệ tọa độ Oxy/Oxyz",
        "[COPY] Tái tạo hình sát nhất từ ảnh/file nguồn",
        "[EMPTY] Giữ khung hình nhưng bỏ dữ kiện số/chữ",
        "[FIX] Sửa trực tiếp code TikZ lỗi"
      ], default:"[TIKZ] Tự động nhận dạng loại hình & sinh code", row:"r1"},
      {key:"chedo", label:"Chế độ xuất code", type:"select", options:[
        "Khối mã TikZ (tikzpicture)",
        "File LaTeX hoàn chỉnh (standalone)"
      ], default:"Khối mã TikZ (tikzpicture)", row:"r1"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn", type:"textarea", placeholder:"VD: Dùng line join=round, line cap=round, font size nhỏ, đặt nhãn dạng LaTeX $...$..."},
      {key:"nguon", label:"Nội dung / Dữ liệu / Trích xuất ảnh nguồn", type:"textarea", placeholder:"Dán nội dung nguồn hoặc văn bản trích xuất từ ảnh nguồn vào đây"}
    ],
    buildUser(v){
      let cmdCode = (v.cmd || "").split(" ")[0];
      let s = `Lệnh: ${cmdCode}\n[CHẾ_ĐỘ_XUẤT]=${v.chedo||"Khối mã TikZ"}\nYêu cầu vẽ hình / sửa code:\n${v.yeucau}\n`;
      if(v.rang_buoc) s+=`\n[RÀNG_BUỘC]=${v.rang_buoc}`;
      if(v.nguon) s+=`\n\nTài liệu/Ảnh nguồn:\n${v.nguon}`;
      return s;
    }
  },
  {
    id:"pdf-ocr-latex", num:"15", name:"OCR & Chuyển đổi Đề Word/LaTeX",
    kicker:"OCR & Biên soạn đề", title:"AI PDF/Image OCR, Chuyển đổi Word/LaTeX & Tạo Đề tương tự",
    desc:"Đọc chính xác nguồn PDF/ảnh đề thi, chuyển sang Markdown/LaTeX (môi trường ex) hoặc Word .docx, tạo đề thi mới tương tự bám sát cấu trúc.",
    system: SYS_PDF_OCR_LATEX, outputType:"text", filename:"de-thi-chuyen-doi.tex",
    fields:[
      {key:"cmd", label:"Lệnh thực thi chính", type:"select", options:[
        "[CONVERTLATEX] Chuyển đề nguồn sang LaTeX (môi trường ex)",
        "[CONVERT] Chuyển nguồn sang Markdown sạch",
        "[CONVERTWORD] Chuyển trực tiếp nguồn sang Word",
        "[TAODELATEX] Tạo đề mới tương tự (LaTeX môi trường ex)",
        "[TAODE] Tạo đề mới tương tự (Markdown)",
        "[TAODEWORD] Tạo đề mới tương tự (Word .docx)"
      ], default:"[CONVERTLATEX] Chuyển đề nguồn sang LaTeX (môi trường ex)", row:"r1"},
      {key:"mon", label:"Môn học", type:"select", options:MON_OPTIONS, default:"Toán", row:"r0"},
      {key:"lop", label:"Khối lớp", type:"select", options:LOP_OPTIONS, default:"Lớp 12", row:"r0"},
      {key:"rang_buoc", label:"Yêu cầu bổ sung / Điều kiện giới hạn", type:"textarea", placeholder:"VD: Chuẩn hóa toàn bộ ngoặc vuông \\left[...\\right], giữ nguyên thứ tự câu, không tự thêm lời giải..."},
      {key:"nguon", label:"Nội dung đề bài / Văn bản trích xuất từ PDF/Ảnh nguồn", type:"textarea", required:true, placeholder:"Dán nội dung đề nguồn hoặc trích xuất từ file PDF/Ảnh ở khung Đính kèm ở trên..."}
    ],
    buildUser(v){
      let cmdCode = (v.cmd || "").split(" ")[0];
      let s = `Lệnh: ${cmdCode}\n[MÔN]=${v.mon||"Toán"}\n[LỚP]=${v.lop||"Lớp 12"}\n`;
      if(v.rang_buoc) s+=`[RÀNG_BUỘC]=${v.rang_buoc}\n`;
      if(v.nguon) s+=`\nNỘI DUNG ĐỀ NGUỒN (PDF/ẢNH):\n\"\"\"\n${v.nguon}\n\"\"\"\n`;
      return s;
    }
  },
  {
    id:"tao-poster-quoc-khanh", num:"16", name:"Poster Sự Kiện & AI Art",
    kicker:"Poster Tùy Chỉnh", title:"Tạo Poster Sự Kiện, Ngày Lễ & Poster AI Art Tùy Chỉnh",
    desc:"Sinh prompt JSON / Text thiết kế poster truyền thông mạng xã hội theo sự kiện tùy chọn (Quốc khánh 2/9, Khai giảng, 20/11, Ngày hội STEM/Toán, Chúc mừng năm mới, Kỷ niệm...) hoặc nghệ thuật cá nhân, hòa trộn chân dung người dùng làm hình chìm nghệ thuật.",
    system: SYS_POSTER_UNIVERSAL, outputType:"json", filename:"poster-su-kien.json",
    fields:[
      {key:"su_kien", label:"Sự kiện / Dịp kỷ niệm (SU_KIEN)", type:"text", placeholder:"VD: Quốc khánh Việt Nam 2/9, Khai giảng năm học mới, Ngày Nhà giáo Việt Nam 20/11, Ngày hội Toán học / STEM, Chúc mừng năm mới, Lễ kỷ niệm thành lập... (Mặc định: Quốc khánh Việt Nam 2/9)", default:"Quốc khánh Việt Nam 2/9"},
      {key:"anh_nhan_vat", label:"Ảnh nhân vật tham chiếu (Mô tả hoặc tải ảnh ở khung Đính kèm)", type:"textarea", placeholder:"Mô tả nhân vật hoặc để trống nếu dùng ảnh người dùng đính kèm ở khung Đính kèm tài liệu nguồn trên."},
      {key:"ty_le", label:"Tỷ lệ khung hình", type:"select", options:["9:16","4:5","1:1","16:9"], default:"9:16", row:"r0"},
      {key:"phong_cach", label:"Phong cách nghệ thuật", type:"select", options:[
        "cinematic patriotic (Điện ảnh yêu nước / Trang trọng)",
        "modern event poster (Poster sự kiện hiện đại)",
        "editorial (Tạp chí cao cấp)",
        "premium poster (Poster sang trọng)",
        "photorealistic (Chân thực như ảnh chụp)",
        "double exposure (Hòa trộn lồng ảnh)",
        "modern Vietnamese (Việt Nam hiện đại)",
        "educational celebration (Lễ hội trường học / Giáo dục)",
        "cyber futuristic (Khoa học & Công nghệ tương lai)"
      ], default:"cinematic patriotic (Điện ảnh yêu nước / Trang trọng)", row:"r0"},
      {key:"text_chinh", label:"Biểu ngữ / Slogan chính (TEXT_CHINH)", type:"text", placeholder:"VD: TỰ HÀO VIỆT NAM / CHÀO MỪNG NĂM HỌC MỚI / TRI ÂN THẦY CÔ (Để trống để AI tự tạo phù hợp sự kiện)", row:"r1"},
      {key:"text_phu", label:"Dòng chữ phụ / Ngày tháng (TEXT_PHU)", type:"text", placeholder:"VD: Kỷ niệm ngày Quốc khánh 02/09 / Năm học 2026 - 2027 / Chào mừng ngày 20-11 (Để trống để AI tự tạo)", row:"r1"},
      {key:"boi_canh", label:"Bối cảnh chính (BOI_CANH)", type:"select", options:[
        "Tự động ngẫu nhiên phù hợp sự kiện",
        "Quảng trường Ba Đình (BA_DINH)",
        "Quốc kỳ tung bay trên nền trời (FLAG_SKY)",
        "Phố phường rực rỡ cờ hoa (HANOI_STREETS)",
        "Không gian trường học & sân trường (SCHOOL_CAMPUS)",
        "Sân khấu sự kiện & ánh đèn hội nghị (EVENT_STAGE)",
        "Phong cảnh quê hương đất nước (VIETNAM_LANDSCAPE)",
        "Skyline đô thị hiện đại (MODERN_CITY)",
        "Hoa sen & dải lụa đỏ (LOTUS_PATRIOTIC)",
        "Bản đồ Việt Nam ánh sáng (VIETNAM_MAP)",
        "Không gian công nghệ & tương lai (TECH_INNOVATION)",
        "Không gian di sản kiến trúc (NATIONAL_HERITAGE)"
      ], default:"Tự động ngẫu nhiên phù hợp sự kiện", row:"r2"},
      {key:"bo_cuc", label:"Bố cục poster (LAYOUT)", type:"select", options:[
        "Tự động phù hợp",
        "Chân dung lớn một bên (PORTRAIT_HERO)",
        "Đường chéo năng động (DIAGONAL_DYNAMIC)",
        "Hòa trộn lồng ảnh (DOUBLE_EXPOSURE)",
        "Biểu tượng trung tâm (CENTERED_MONUMENT)",
        "Bìa tạp chí cao cấp (EDITORIAL_MAGAZINE)",
        "Phong cảnh điện ảnh rộng (CINEMATIC_LANDSCAPE)"
      ], default:"Tự động phù hợp", row:"r2"},
      {key:"render_style", label:"Hiệu ứng hòa trộn nhân vật", type:"select", options:[
        "double exposure portrait (Chân dung phơi sáng kép)",
        "layered cinematic portrait (Chân dung điện ảnh nhiều lớp)",
        "soft transparent patriotic portrait (Chân dung hình chìm trong suốt)",
        "editorial faded portrait (Chân dung mờ phong cách tạp chí)",
        "cinematic silhouette blending (Hòa trộn bóng điện ảnh)"
      ], default:"double exposure portrait (Chân dung phơi sáng kép)", row:"r3"},
      {key:"anh_sang", label:"Phong cách ánh sáng (LIGHTING)", type:"select", options:[
        "Tự động phù hợp sự kiện",
        "Bình minh vàng (golden sunrise)",
        "Nền ấm áp (soft warm backlight)",
        "Viền sáng kịch tính (dramatic rim light)",
        "Ánh sáng hào hùng (volumetric patriotic light)",
        "Ban ngày tươi sáng (bright daylight)",
        "Hoàng hôn điện ảnh (cinematic sunset)",
        "Ánh sáng sân khấu sự kiện (stage lights)"
      ], default:"Tự động phù hợp sự kiện", row:"r3"},
      {key:"palette", label:"Bảng màu nhận diện", type:"select", options:[
        "Tự động phù hợp sự kiện",
        "Đỏ son + vàng kim + trắng (Quốc khánh / Lễ hội)",
        "Xanh dương + trắng + vàng (Giáo dục / Công nghệ / STEM)",
        "Đỏ đô + vàng champagne (Sang trọng)",
        "Đỏ rực + vàng bình minh",
        "Xanh lá + vàng pastel (Thân thiện / Môi trường)",
        "Tím gradient + neon (Công nghệ / Sáng tạo)",
        "Đỏ điện ảnh + vùng tối tương phản"
      ], default:"Tự động phù hợp sự kiện", row:"r4"},
      {key:"rang_buoc", label:"Yêu cầu ràng buộc / Điều kiện giới hạn", type:"textarea", placeholder:"VD: Giữ chính xác 100% diện mạo khuôn mặt từ ảnh tham chiếu, chữ tiếng Việt chuẩn dấu, độ tương phản cao, đúng chủ đề sự kiện đã chọn..."},
      {key:"nguon", label:"Nội dung / Thông điệp bổ sung", type:"textarea", placeholder:"Dán thông điệp truyền thông, lời chúc, thời gian/địa điểm hoặc dữ liệu bài viết bổ sung nếu có"}
    ],
    buildUser(v){
      let suKien = (v.su_kien || "").trim() || "Quốc khánh Việt Nam 2/9";
      let s = `[SU_KIEN]=${suKien}\n` +
        `[ANH_NHAN_VAT]=${v.anh_nhan_vat || "Ảnh chân dung nam/nữ người dùng tải lên (Tham chiếu nhận diện bắt buộc)"}\n` +
        `[TY_LE]=${v.ty_le || "9:16"}\n` +
        `[PHONG_CACH]=${v.phong_cach || "cinematic patriotic"}\n` +
        `[TEXT_CHINH]=${v.text_chinh || "Để AI tự chọn ngẫu nhiên slogan phù hợp sự kiện"}\n` +
        `[TEXT_PHU]=${v.text_phu || "Để AI tự chọn dòng phụ phù hợp sự kiện"}\n` +
        `[BOI_CANH]=${v.boi_canh || "Tự động ngẫu nhiên phù hợp sự kiện"}\n` +
        `[BO_CUC]=${v.bo_cuc || "Tự động phù hợp"}\n` +
        `[HOA_TRON_NHAN_VAT]=${v.render_style || "double exposure portrait"}\n` +
        `[ANH_SANG]=${v.anh_sang || "Tự động phù hợp sự kiện"}\n` +
        `[BANG_MAU]=${v.palette || "Tự động phù hợp sự kiện"}\n`;
      if(v.rang_buoc) s += `[RANG_BUOC]=${v.rang_buoc}\n`;
      if(v.nguon) s += `\nNội dung / Thông điệp bổ sung:\n${v.nguon}`;
      return s;
    }
  }
];

/* ==========================================================================
   HƯỚNG DẪN CHI TIẾT CHO CẢ 16 CÔNG CỤ (GUIDES DATA)
   ========================================================================== */
const GUIDES = {
  "tao-poster-quoc-khanh": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Biên soạn PROMPT JSON & Prompt Tiếng Anh chuẩn thiết kế Poster truyền thông mạng xã hội theo bất kỳ sự kiện nào (Quốc khánh 02/09, Khai giảng, 20/11, Ngày hội STEM/Toán, Năm mới, Kỷ niệm thành lập...), hòa trộn ảnh chân dung người dùng tải lên thành hình chìm nghệ thuật đỉnh cao.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Điền Sự kiện / Dịp kỷ niệm:</strong> Nhập sự kiện bạn muốn tạo poster (VD: <em>Quốc khánh Việt Nam 2/9</em>, <em>Khai giảng năm học mới</em>, <em>Ngày Nhà giáo 20/11</em>, <em>Ngày hội STEM</em>, <em>Chúc mừng năm mới</em>...).</li>
      <li><strong>Tải / Đính kèm ảnh chân dung:</strong> Sử dụng ô <em>📎 Đính kèm tài liệu nguồn</em> phía trên để tải lên 1 ảnh chân dung nam/nữ rõ mặt (hoặc nhập mô tả nhân vật vào ô Ảnh nhân vật).</li>
      <li><strong>Tỷ lệ khung hình & Phong cách:</strong> Chọn tỷ lệ <code>9:16</code> (Story/TikTok), <code>4:5</code> (Facebook Feed), <code>1:1</code> (Instagram) và phong cách nghệ thuật phù hợp.</li>
      <li><strong>Điền biểu ngữ (Tùy chọn):</strong> Nhập <code>TEXT_CHINH</code> và <code>TEXT_PHU</code> mong muốn. Nếu để trống, AI sẽ tự động sáng tạo câu slogan chuẩn xác bám sát sự kiện.</li>
      <li><strong>Bối cảnh & Bố cục:</strong> Tự động ngẫu nhiên theo sự kiện, hoặc chọn Quảng trường Ba Đình, Trường học, Sân khấu sự kiện, Phố cờ hoa, Skyline đô thị...</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0 0 6px;"><strong>1. Dùng Prompt Tiếng Anh cho AI vẽ ảnh:</strong> Copy đoạn <em>English Image Prompt</em> thu được dán vào Midjourney v6, Flux.1, Ideogram hoặc DALL-E 3 kèm cờ <code>--cref [URL_ANH_GOC]</code> để giữ nguyên khuôn mặt nhân vật.</p>
    <p style="margin:0;"><strong>2. Dùng Prompt JSON cho thiết kế:</strong> Dán mã JSON vào các công cụ AI tự động tạo layout poster để xuất sản phẩm truyền thông chuyên nghiệp.</p>
  `,
  "video-veo3": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Biên soạn kịch bản video khởi động bài học (5 phân cảnh) ngắn gọn, sinh động, kích thích sự tò mò và mở ra mâu thuẫn nhận thức để giáo viên dẫn dắt vào bài mới.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Chọn môn học (Toán, Lý, Hóa, Văn, Tiếng Anh...) và khối lớp tương ứng (Lớp 6 đến Lớp 12).</li>
      <li><strong>Nhập tên bài học/chủ đề:</strong> Ghi chính xác tên bài (VD: <em>Giá trị lớn nhất, giá trị nhỏ nhất của hàm số</em>).</li>
      <li><strong>Chọn tỷ lệ khung hình:</strong> <code>16:9</code> cho màn hình máy tính/TV, <code>9:16</code> cho điện thoại/TikTok.</li>
      <li><strong>Tóm tắt / Nhân vật (Tùy chọn):</strong> Nhập bối cảnh tình huống thực tế hoặc tên nhân vật muốn xuất hiện. Nếu bỏ trống, AI sẽ tự tạo 2-3 nhân vật phù hợp.</li>
      <li><strong>Tài liệu nguồn:</strong> Dán nội dung bài học để AI bám sát kiến thức cốt lõi.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">AI sẽ xuất ra: <strong>Hồ sơ nhân vật (Character Lock)</strong>, <strong>Storyboard</strong>, <strong>Prompt ảnh từng cảnh</strong> và <strong>Prompt Veo 3</strong>. Sao chép từng prompt Veo 3 dán vào Google Veo 3 / VideoFX để tạo video.</p>
  `,

  "phieu-hoc-tap": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Sinh prompt JSON chuẩn thiết kế Infographic Phiếu học tập đa dạng dạng bài (Điền khuyết, Ghép đôi, Đúng/Sai, Trắc nghiệm, Tự luận) giúp học sinh luyện tập.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Chọn môn học và khối lớp của phiếu học tập.</li>
      <li><strong>Tên bài học/chủ đề:</strong> Nhập tên bài học cần tạo phiếu.</li>
      <li><strong>Số lượng câu hỏi:</strong> Tùy chỉnh số lượng cho 5 trạm/dạng bài. Nếu dạng nào để số 0, AI sẽ tự động bỏ trạm đó.</li>
      <li><strong>Kèm đáp án / lời giải:</strong> Chọn <code>BẬT</code> để tạo thêm Phần 2 (Đáp án & Hướng dẫn chấm).</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Dán đoạn mã PROMPT JSON thu được vào ChatGPT/Gemini/Napkin AI hoặc Midjourney để vẽ phiếu học tập trực quan chuyên nghiệp.</p>
  `,

  "mindmap": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Tổng hợp 95% lý thuyết cốt lõi của bài học thành Infographic Sơ đồ tư duy (Mindmap) khổ A4 phong cách retro, trực quan phục vụ bài giảng.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Tự do chọn bất kỳ môn học và khối lớp nào.</li>
      <li><strong>Tên bài học:</strong> Nhập số thứ tự và tên bài (VD: <em>Bài 1. Khảo sát sự biến thiên hàm số</em>).</li>
      <li><strong>Nội dung bài học:</strong> Dán văn bản lý thuyết sách giáo khoa vào ô Tài liệu nguồn.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Dùng PROMPT JSON để tạo ảnh Infographic tóm tắt bài học phục vụ chiếu bài giảng hoặc in tài liệu học tập.</p>
  `,

  "geogebra": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Tự động chuyển đổi yêu cầu dựng hình toán học tự nhiên thành mã lệnh Script GeoGebra 2D/3D sẵn sàng dán chạy ngay.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Khối lớp & Yêu cầu dựng hình:</strong> Chọn khối lớp (Lớp 6 đến 12) và mô tả chi tiết hình vẽ.</li>
      <li><strong>Không gian:</strong> Chọn 2D hoặc 3D.</li>
      <li><strong>Tùy chọn hiển thị:</strong> Tích chọn Hiện nhãn, Ẩn đối tượng phụ, Phân màu trực quan.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Mở phần mềm GeoGebra -> Vào ô Nhập lệnh (Input Command) hoặc cửa sổ Lập trình -> Dán đoạn script vào để tự động vẽ hình chuẩn xác 100%.</p>
  `,

  "de-22-cau": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Biên soạn đề kiểm tra các môn học chuẩn cấu trúc mới của Bộ GD&ĐT gồm 22 câu (12 Trắc nghiệm + 4 Đúng/Sai + 6 Trả lời ngắn) tích hợp công thức LaTeX và hình vẽ TikZ.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Chọn môn học (Toán, Vật lý, Hóa học...) và khối lớp cần ra đề.</li>
      <li><strong>Tiêu đề đề thi & Chương/chủ đề:</strong> Nhập tiêu đề đề thi và các nội dung ôn tập.</li>
      <li><strong>Điều chỉnh số câu:</strong> Tùy chỉnh số lượng câu cho 3 phần nếu muốn.</li>
      <li><strong>Tài liệu nguồn:</strong> Dán ma trận đề hoặc nội dung kiến thức bám sát.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Bấm nút <strong>📄 Xuất file Word (.doc)</strong> để tải đề thi về máy chỉnh sửa trên Microsoft Word hoặc dán mã TikZ/LaTeX vào Overleaf/MathType.</p>
  `,

  "toan-thuc-te": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Biên soạn tập bài toán thực tế chuẩn SGK Kết nối tri thức (KNTT) kết hợp MATH FIGURE LOCK (khóa chặt Math Layer & Art Layer). Xuất kết quả dưới dạng mã Prompt code để dễ dàng sao chép sang trình duyệt Gemini/ChatGPT tạo ảnh và biên soạn tài liệu, đồng thời hỗ trợ xuất trực tiếp ra file Word (.doc).</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn dạng:</strong> Chọn <em>Infographic minh họa 3 cột (JSON)</em> hoặc <em>Đề bài thực tế (văn bản)</em>.</li>
      <li><strong>Chọn Môn học & Khối lớp:</strong> Lựa chọn môn học và khối lớp (ví dụ: Toán - Lớp 10).</li>
      <li><strong>Chủ đề & Số câu:</strong> Nhập tên chủ đề (VD: Hệ thức lượng trong tam giác) và số câu cần tạo (VD: 4 câu).</li>
      <li><strong>Chế độ trình bày & Phong cách:</strong> Chọn chế độ <em>Học sinh (chừa dòng kẻ làm bài)</em> hoặc <em>Giáo viên (có lời giải chi tiết)</em> và phong cách (VD: Sketchnote mực xanh chủ đạo).</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">- Bấm <strong>📋 Sao chép</strong> để lấy toàn bộ mã Prompt dán trực tiếp vào <strong>Gemini hoặc ChatGPT</strong> trên trình duyệt để sinh ảnh minh họa và nội dung hoàn chỉnh.<br>- Bấm <strong>📄 Xuất file Word (.doc)</strong> để tải ngay tài liệu bài tập dạng bảng 3 cột / đề bài chuẩn Word về máy tính để in ấn hoặc phát cho học sinh.</p>
  `,

  "truyen-tranh": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Lồng ghép kiến thức bài học vào các câu chuyện tranh sinh động với những nhân vật hoạt hình quen thuộc với học sinh.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Lựa chọn môn học và khối lớp.</li>
      <li><strong>Phong cách nhân vật:</strong> Chọn nhân vật yêu thích (Doraemon, Tom & Jerry, Hãy đợi đấy, Sketchnote...).</li>
      <li><strong>Số cảnh truyện & Nội dung:</strong> Nhập số cảnh (VD: 4 cảnh) và bài học cần lồng ghép.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Copy các đoạn prompt mô tả cảnh tranh dán vào các công cụ AI vẽ ảnh (Midjourney, DALL-E 3, Bing Image Creator) để sinh bộ truyện tranh bài học.</p>
  `,

  "game-quiz": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Tạo một Mini Game / Quiz trắc nghiệm tương tác dạng file HTML đơn file chạy trực tiếp trên máy tính và điện thoại, có tự động chấm điểm và đánh giá năng lực.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Môn học & Khối lớp:</strong> Lựa chọn môn học và khối lớp cho Quiz.</li>
      <li><strong>Tên bài học / chủ đề:</strong> Nhập nội dung cần kiểm tra.</li>
      <li><strong>Số câu hỏi & Mức độ:</strong> Chọn số câu và mức độ (Hỗn hợp, Dễ, Trung bình, Khó).</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Bấm tab <strong>👁 Xem trước giao diện</strong> để chơi thử quiz ngay trong ứng dụng! Bấm <strong>💾 Tải file về máy</strong> để lấy file <code>.html</code> cho học sinh làm bài.</p>
  `,

  "mail-ao": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Hướng dẫn phương pháp Gmail Alias an toàn để tạo nhiều tài khoản thử nghiệm các dịch vụ AI (ChatGPT, Gemini, Claude...) mà không sợ bị dính virus, quảng cáo rác hay rò rỉ thông tin.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Tạo Email Alias:</strong> Lấy email Gmail chính của bạn và thêm dấu <code>+</code> đằng sau tên (VD: <code>tengiaovien+test1@gmail.com</code>).</li>
      <li><strong>Đăng ký tài khoản AI:</strong> Dùng email này để tạo tài khoản mới tại Google AI Studio hoặc ChatGPT.</li>
      <li><strong>Nhận mã OTP:</strong> Mở hộp thư Gmail chính của bạn để nhận mã xác thực OTP ngay lập tức.</li>
      <li>Tránh tuyệt đối việc nhấp vào các trang mail ảo lạ trên internet chứa quảng cáo độc hại.</li>
    </ol>
  `,

  "toan-tieng-anh-clil": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Phát triển đồng thời <strong>Năng lực Chuyên môn Môn học</strong> và <strong>Năng lực Ngôn ngữ</strong> (Tiếng Anh là ngôn ngữ thứ hai) theo phương pháp CLIL chuẩn chỉ đạo của Bộ GD&ĐT & Sở GD&ĐT TP.HCM.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Chọn Dạng bài sản xuất:</strong>
        <ul>
          <li><em>Bài học Từ vựng & Mẫu câu:</em> Trích xuất thuật ngữ IPA, cách đọc công thức, mẫu câu giao tiếp và hội thoại thầy-trò.</li>
          <li><em>Infographic / Flashcard:</em> Trả về prompt JSON để AI sinh ảnh học từ vựng và công thức trực quan.</li>
        </ul>
      </li>
      <li><strong>Điền thông tin:</strong> Chọn Môn học, chọn Khối lớp, nhập tên chủ đề bài học, chọn trình độ Tiếng Anh học sinh và tích chọn các mục bổ trợ.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Copy prompt thu được dán vào Gemini / ChatGPT để nhận bài giảng song ngữ hoàn chỉnh, dùng mẫu câu đọc công thức & hội thoại giảng dạy trực tiếp trên lớp CLIL.</p>
  `,

  "tao-nhan-vat": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Tạo Hồ sơ khóa nhân vật (Character Lock Profile) và bộ prompt tham chiếu tiêu chuẩn giúp sinh nhân vật trong ảnh/video hoàn toàn đồng nhất qua nhiều phân cảnh khác nhau.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Điền tên & phong cách:</strong> Nhập tên nhân vật (VD: <em>Thầy Hùng Toán</em>) và chọn phong cách nghệ thuật (Pixar 3D, Anime, Điện ảnh...).</li>
      <li><strong>Mô tả chi tiết ngoại hình & trang phục cố định:</strong> Nhập đặc điểm khuôn mặt (mắt, kiểu tóc, kính) và quần áo cố định. Mẹo: giữ nguyên màu sắc trang phục nhận diện!</li>
      <li><strong>Điền tính cách & giọng nói:</strong> Giúp AI tạo hồ sơ thoại và bối cảnh chuẩn.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Hướng dẫn tạo video/ảnh đồng nhất từng bước:</h4>
    <p style="margin:0 0 6px;"><strong>1. Tạo bộ ảnh gốc (Character Sheet):</strong> Copy Prompt ở PHẦN 2 dán vào Midjourney / Flux / Ideogram để sinh ra 4 ảnh gốc (Front, 3/4, Close-up, Action).</p>
    <p style="margin:0 0 6px;"><strong>2. Dùng cờ '--cref' (Midjourney):</strong> Copy URL ảnh vừa tạo, dán vào prompt phân cảnh sau với cú pháp: <code>[Prompt cảnh mới] --cref [URL_ANH_GOC] --cw 100</code>.</p>
    <p style="margin:0;"><strong>3. Dùng Google Veo 3 / VideoFX:</strong> Chèn đoạn text "Character Physical Appearance Lock" ở PHẦN 3 vào từng phân cảnh kịch bản Veo 3 để giữ gương mặt & trang phục không thay đổi.</p>
  `,

  "kiem-soat-prompt": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Đánh giá chất lượng prompt, phát hiện lỗi mâu thuẫn từ khóa, và tự động nâng cấp/sửa lỗi cho prompt ảnh/video (đặc biệt xử lý lỗi thiếu chính xác, biến dạng hình ảnh, mờ mặt, thừa ngón).</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Dán prompt gốc:</strong> Nhập đoạn prompt bạn vừa tạo hoặc prompt gặp sự cố. Mẹo: Nếu vừa tạo prompt ở các công cụ khác, hãy bấm nút <strong>🔍 Kiểm tra & Sửa lỗi prompt này</strong> ở dưới bảng kết quả.</li>
      <li><strong>Chọn công cụ AI:</strong> Chọn Midjourney, Flux, Google Veo 3...</li>
      <li><strong>Mô tả lỗi:</strong> Ghi rõ hình ảnh/video bị lỗi gì (VD: <em>bị biến dạng tay, nét mặt không rõ, sai góc máy, bị mờ phông nền...</em>).</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Kết quả thu được:</h4>
    <p style="margin:0;">AI sẽ phân tích điểm chính xác (Prompt Accuracy Score), nêu nguyên nhân lỗi và cấp cho bạn đoạn <strong>Prompt đã sửa chuẩn hóa 100%</strong> kèm danh sách <strong>Negative Prompts</strong> loại bỏ hoàn toàn các biến dạng.</p>
  `,

  "giai-de-dap-an": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Phân tích đề bài và lập bộ Lời giải chi tiết, Bảng đáp án nhanh, Thang điểm và Phân tích cạm bẫy lỗi sai từ đề bài dán trực tiếp hoặc trích xuất từ file (.docx, .pdf, ảnh) với dung lượng không quá 4 trang A4.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Đính kèm file đề bài (Nếu có):</strong> Dùng khung <em>📎 Đính kèm tài liệu nguồn</em> ở trên để trích xuất file đề thi (.docx, .pdf hoặc ảnh chụp trang đề). Nội dung sẽ tự động điền vào ô Đề bài.</li>
      <li><strong>Chọn Môn học & Khối lớp:</strong> Chọn môn học (Toán, Lý, Hóa...) và khối lớp của đề thi.</li>
      <li><strong>Điền tiêu đề & dạng đề:</strong> Nhập tên bài kiểm tra và chọn dạng đề (22 câu, Trắc nghiệm, Tự luận...).</li>
      <li><strong>Tùy chọn hiển thị:</strong> Tích chọn Kèm Bảng đáp án nhanh, Lời giải chi tiết, Thang điểm, Phân tích lỗi sai.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Cách sử dụng kết quả:</h4>
    <p style="margin:0;">Bấm <strong>📄 Xuất file Word (.doc)</strong> hoặc <strong>📋 Sao chép</strong> để lấy toàn bộ Lời giải chi tiết & Đáp án chuẩn phục vụ giảng dạy, chấm bài hoặc phát tài liệu cho học sinh.</p>
  `,

  "tikz-expert": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Tự động phân tích hình học, bảng biến thiên, đồ thị hàm số và vectơ để tạo mã LaTeX TikZ (hoặc tkz-tab) hoàn chỉnh, đẹp mắt, chính xác toán học và có thể sao chép dùng trực tiếp trong Overleaf / tài liệu LaTeX.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Mô tả hình cần vẽ / dán mã TikZ bị lỗi:</strong> Nhập chi tiết yêu cầu vẽ hình hoặc dán mã TikZ cần sửa vào khung.</li>
      <li><strong>Chọn Lệnh chức năng (Optional Command):</strong> Tự chọn <code>[TIKZ]</code>, <code>[BBT]</code> (bảng biến thiên tkz-tab), <code>[DOTHI]</code>, <code>[HINHHOC]</code>, <code>[VECTOR]</code>, <code>[COPY]</code>, <code>[EMPTY]</code> hoặc <code>[FIX]</code>.</li>
      <li><strong>Đính kèm ảnh nguồn (Nếu có):</strong> Dùng ô Đính kèm tài liệu/ảnh ở trên để tải ảnh chứa hình cần vẽ.</li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Kết quả thu được:</h4>
    <p style="margin:0;">AI sẽ sinh ra đoạn mã TikZ thuần (hoặc tkz-tab) chuẩn từng nét liền, nét đứt, nhãn điểm toán học và tiệm cận. Bạn chỉ cần sao chép dán trực tiếp vào file TeX trên Overleaf hoặc phần mềm biên dịch LaTeX.</p>
  `,

  "pdf-ocr-latex": `
    <h4 style="margin:8px 0 4px;color:#123832;">🎯 Mục tiêu:</h4>
    <p style="margin:0 0 10px;">Nhận dạng OCR học thuật từ file PDF hoặc ảnh đề thi, chuyển đổi sang Markdown, LaTeX môi trường ex (chứa <code>\\choice</code>, <code>\\choiceTF</code>, <code>\\shortans</code>) hoặc Word <code>.docx</code>, đồng thời tự động chuẩn hóa 100% công thức ngoặc vuông <code>[...]</code> thành <code>\\left[...\\right]</code>.</p>
    <h4 style="margin:8px 0 4px;color:#123832;">📋 Các bước thực hiện:</h4>
    <ol style="margin:0 0 10px;padding-left:20px;">
      <li><strong>Tải file PDF/Ảnh đề thi:</strong> Dùng khung <em>📎 Đính kèm tài liệu nguồn</em> để trích xuất đề thi.</li>
      <li><strong>Chọn Lệnh thực thi:</strong>
        <ul>
          <li><code>[CONVERTLATEX]</code>: Chuyển nguyên đề sang LaTeX môi trường <code>ex</code>.</li>
          <li><code>[CONVERT]</code>: Chuyển sang Markdown sạch.</li>
          <li><code>[CONVERTWORD]</code>: Chuyển nguyên đề sang Word.</li>
          <li><code>[TAODELATEX]</code> / <code>[TAODE]</code> / <code>[TAODEWORD]</code>: Biên soạn đề thi mới tương tự đề nguồn.</li>
        </ul>
      </li>
      <li>Bấm <strong>✨ Tạo prompt</strong>.</li>
    </ol>
    <h4 style="margin:8px 0 4px;color:#123832;">💡 Kết quả thu được:</h4>
    <p style="margin:0;">File mã LaTeX sạch sẽ hoặc tài liệu đề thi đã chuẩn hóa công thức toán học, sẵn sàng in ấn hoặc biên dịch tức thì.</p>
  `
};
