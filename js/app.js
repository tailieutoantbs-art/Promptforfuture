/* ==========================================================================
   MAIN APPLICATION CONTROLLER & EVENT LISTENERS
   ========================================================================== */

let currentTool = (typeof TOOLS !== 'undefined' && Array.isArray(TOOLS) && TOOLS.length > 0) ? TOOLS[0] : null;
let sourceText = "";

/* --- TOOL GROUPS & SIDEBAR MENU INITIALIZATION --- */
const TOOL_GROUPS = [
  {
    id: "g1",
    name: "🎬 Video, Hình Ảnh & AI Art",
    toolIds: ["video-veo3", "tao-poster-quoc-khanh", "mindmap", "truyen-tranh", "tao-nhan-vat"]
  },
  {
    id: "g2",
    name: "📝 Soạn Đề Thi, Bài Tập & OCR",
    toolIds: ["phieu-hoc-tap", "de-22-cau", "toan-thuc-te", "pdf-ocr-latex"]
  },
  {
    id: "g3",
    name: "📐 Toán Học, Game & Dựng Hình",
    toolIds: ["geogebra", "game-quiz", "tikz-expert"]
  },
  {
    id: "g4",
    name: "💡 Trợ Lý, Sửa Lỗi & Hướng Dẫn",
    toolIds: ["mail-ao", "toan-tieng-anh-clil", "kiem-soat-prompt", "giai-de-dap-an"]
  }
];

function initSidebarMenu(){
  const dropdown = document.getElementById("sidebarToolDropdown");
  if(dropdown){
    if(!dropdown.options || dropdown.options.length === 0){
      dropdown.innerHTML = TOOL_GROUPS.map(grp => {
        const opts = grp.toolIds.map(tid => {
          const t = (typeof TOOLS !== 'undefined' ? TOOLS : []).find(x => x.id === tid);
          if(!t) return "";
          return `<option value="${t.id}">${t.num} ${t.name}</option>`;
        }).join("");
        return `<optgroup label="${grp.name}">${opts}</optgroup>`;
      }).join("");
    }
    if(currentTool) dropdown.value = currentTool.id;

    if(dropdown.dataset && !dropdown.dataset.hasListener){
      dropdown.dataset.hasListener = "true";
      dropdown.addEventListener("change", (e)=>{
        if(e.target.value) selectTool(e.target.value);
      });
    }
  }

  const toolList = document.getElementById("toolList");
  if(toolList){
    const existingItems = toolList.querySelectorAll(".tool-item");
    if(!existingItems || existingItems.length === 0){
      toolList.innerHTML = "";
      TOOL_GROUPS.forEach(grp => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "tool-group-box";
        if(groupDiv.dataset) groupDiv.dataset.group = grp.id;
        
        const header = document.createElement("div");
        header.className = "tool-group-header";
        header.innerHTML = `<span>${grp.name}</span><span class="grp-toggle">▲</span>`;
        header.addEventListener("click", () => {
          groupDiv.classList.toggle("collapsed");
        });
        groupDiv.appendChild(header);

        const ul = document.createElement("ul");
        ul.className = "tool-group-list";

        grp.toolIds.forEach(tid => {
          const t = (typeof TOOLS !== 'undefined' ? TOOLS : []).find(x => x.id === tid);
          if(!t) return;
          const li = document.createElement("li");
          li.className = "tool-item" + ((currentTool && t.id === currentTool.id) ? " active" : "");
          if(li.dataset) li.dataset.id = t.id;
          li.innerHTML = `<span class="tool-num">${t.num}</span><span class="tool-name">${t.name}</span>`;
          li.addEventListener("click", () => {
            selectTool(t.id);
            if(window.innerWidth <= 860){
              const sidebar = document.getElementById("sidebar");
              if(sidebar) sidebar.classList.remove("open");
            }
          });
          ul.appendChild(li);
        });

        groupDiv.appendChild(ul);
        toolList.appendChild(groupDiv);
      });
    } else {
      // Bind click listeners to pre-rendered HTML items
      toolList.querySelectorAll(".tool-group-header").forEach(header => {
        if(header.dataset && !header.dataset.hasListener){
          header.dataset.hasListener = "true";
          header.addEventListener("click", () => {
            const groupDiv = header.closest(".tool-group-box");
            if(groupDiv) groupDiv.classList.toggle("collapsed");
          });
        }
      });

      toolList.querySelectorAll(".tool-item").forEach(li => {
        if(li.dataset && !li.dataset.hasListener){
          li.dataset.hasListener = "true";
          li.addEventListener("click", () => {
            const tid = li.dataset ? li.dataset.id : li.getAttribute("data-id");
            if(tid) selectTool(tid);
            if(window.innerWidth <= 860){
              const sidebar = document.getElementById("sidebar");
              if(sidebar) sidebar.classList.remove("open");
            }
          });
        }
      });
    }
  }
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initSidebarMenu);
} else {
  initSidebarMenu();
}
window.addEventListener("load", initSidebarMenu);

// Mobile menu button
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
if(mobileMenuBtn){
  mobileMenuBtn.addEventListener("click", ()=>{
    document.getElementById("sidebar").classList.toggle("open");
  });
}

function selectTool(id){
  if(typeof TOOLS === 'undefined' || !Array.isArray(TOOLS) || TOOLS.length === 0) return;
  if(!currentTool) currentTool = TOOLS[0];
  if(currentTool && !currentTool.isInfo){
    formValuesCache[currentTool.id] = collectValues();
  }
  
  currentTool = TOOLS.find(t=>t.id===id) || TOOLS[0];
  document.querySelectorAll(".tool-item").forEach(el=>{
    el.classList.toggle("active", el.dataset.id===id);
  });

  const sidebarToolDropdown = document.getElementById("sidebarToolDropdown");
  if(sidebarToolDropdown) sidebarToolDropdown.value = currentTool.id;

  const activeGroup = TOOL_GROUPS.find(g => g.toolIds.includes(currentTool.id));
  if(activeGroup){
    document.querySelectorAll(".tool-group-box").forEach(box => {
      if(box.dataset.group === activeGroup.id){
        box.classList.remove("collapsed");
        const toggle = box.querySelector(".grp-toggle");
        if(toggle) toggle.textContent = "▲";
      }
    });
  }

  document.getElementById("kicker").textContent = currentTool.kicker;
  document.getElementById("toolTitle").textContent = currentTool.title;
  document.getElementById("toolDesc").textContent = currentTool.desc;

  const wsWrap = document.getElementById("worksheetPreview");
  if(wsWrap){ wsWrap.innerHTML = ""; wsWrap.style.display = "none"; }
  const aiWrap = document.getElementById("aiImageRenderWrap");
  if(aiWrap){ aiWrap.innerHTML = ""; aiWrap.style.display = "none"; }
  const tabPrev = document.getElementById("tabPreview");
  if(tabPrev) tabPrev.style.display = "none";

  const renderAiImgBtn = document.getElementById("renderAiImgBtn");
  if(renderAiImgBtn){
    if(currentTool.id === "toan-thuc-te"){
      renderAiImgBtn.style.display = "none";
    } else {
      renderAiImgBtn.style.display = "inline-flex";
    }
  }
  
  try {
    renderSourceArea();
  } catch(err){
    console.warn("Lỗi renderSourceArea:", err);
  }

  try {
    renderForm();
  } catch(err){
    console.warn("Lỗi renderForm:", err);
  }
}

/* --- RENDER SOURCE AREA --- */
function renderSourceArea(){
  const area = document.getElementById("sourceArea");
  if(!area) return;
  if(currentTool.isInfo){ area.innerHTML = ""; return; }
  
  area.innerHTML = `
    <div class="field" id="sourceFieldBox" style="border:1px dashed var(--line);background:var(--card-bg);border-radius:10px;padding:14px 16px;margin-bottom:18px;">
      <label class="collapsible-header" id="srcCollapsibleHeader" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;cursor:pointer;">
        <span style="font-weight:600;display:flex;align-items:center;gap:6px;font-size:13px;color:var(--chalk);">📎 Đính kèm tài liệu nguồn (File / Link / Văn bản) <span class="toggle-icon">▲</span></span>
        <button class="btn btn-ghost btn-sm" id="srcSelectFromRepoBtn" type="button" style="color:var(--yellow);border-color:rgba(242,193,78,0.45);font-size:11.5px;">📚 Chọn từ Kho nguồn</button>
      </label>
      <div class="collapsible-body" id="srcCollapsibleBody" style="margin-top:12px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <input type="file" id="srcFile" accept=".pdf,.doc,.docx,.txt,.md,.json,image/*" style="flex:1;min-width:180px;background:rgba(245,241,228,.06);border:1px solid var(--line);color:var(--chalk);border-radius:6px;padding:6px 10px;font-size:12.5px;">
          <button class="btn btn-ghost btn-sm" id="srcFileBtn" type="button">Trích xuất file</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <input type="text" id="srcLink" placeholder="Dán liên kết (Google Drive, Docs, web tài liệu...)" style="flex:1;">
          <button class="btn btn-ghost btn-sm" id="srcLinkBtn" type="button">Lấy từ link</button>
        </div>
        <div class="quick-link-bar">
          <select id="srcQuickLinkSelect" class="quick-link-select">
            <option value="">🔗 Chọn nhanh link thường dùng...</option>
          </select>
          <button class="btn btn-ghost btn-sm" id="openSavedLinksManageBtn" type="button" style="color:var(--yellow);border-color:rgba(242,193,78,0.45);font-size:11.5px;">⚙ Quản lý Link mẫu</button>
        </div>
        <textarea id="srcText" placeholder="Nội dung nguồn trích xuất được sẽ hiện ở đây — bạn có thể sửa trực tiếp." style="margin-top:8px;min-height:64px;"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;flex-wrap:wrap;gap:6px;">
          <button class="btn btn-ghost btn-sm" id="srcSaveToRepoBtn" type="button" style="color:#8CE99A;border-color:rgba(140,233,154,0.45);font-size:11.5px;">⭐ Lưu nội dung này vào Kho nguồn dữ liệu</button>
          <div class="status" id="srcStatus"></div>
        </div>
      </div>
    </div>`;

  document.getElementById("srcCollapsibleHeader").addEventListener("click", (e)=>{
    if(e.target.closest("#srcSelectFromRepoBtn")) return;
    const box = document.getElementById("sourceFieldBox");
    const icon = box.querySelector(".toggle-icon");
    box.classList.toggle("collapsed");
    if(icon) icon.textContent = box.classList.contains("collapsed") ? "▼" : "▲";
  });
  
  const srcTextEl = document.getElementById("srcText");
  srcTextEl.value = sourceText;
  srcTextEl.addEventListener("input", e=>{ sourceText = e.target.value; });

  renderSavedLinksDropdown();

  document.getElementById("srcQuickLinkSelect").addEventListener("change", (e)=>{
    const url = e.target.value;
    if(url){
      document.getElementById("srcLink").value = url;
      document.getElementById("srcLinkBtn").click();
    }
  });

  document.getElementById("openSavedLinksManageBtn").addEventListener("click", ()=>{
    document.getElementById("savedLinksManageModal").style.display = "flex";
    renderSavedLinksList();
  });

  document.getElementById("srcSelectFromRepoBtn").addEventListener("click", ()=>{
    document.getElementById("sourcesBtn").click();
  });

  document.getElementById("srcSaveToRepoBtn").addEventListener("click", ()=>{
    const content = srcTextEl.value.trim();
    if(!content){
      alert("Chưa có nội dung nguồn để lưu.");
      return;
    }
    const defaultTitle = "Nguồn bài học - " + new Date().toLocaleString("vi-VN");
    const title = prompt("Nhập tên nguồn để lưu vào Kho nguồn dữ liệu:", defaultTitle);
    if(title === null) return;
    
    const newSource = {
      id: Date.now(),
      title: title.trim() || defaultTitle,
      type: "Tài liệu tham khảo",
      time: new Date().toLocaleString("vi-VN"),
      content: content
    };

    const sources = getSourcesData();
    sources.unshift(newSource);
    saveSourcesData(sources);

    if(fbDb){
      fbDb.collection("shared_sources").doc(String(newSource.id)).set(newSource).catch(err=>console.log(err));
    }

    const st = document.getElementById("srcStatus");
    st.className = "status ok";
    st.textContent = "✓ Đã lưu nguồn vào Kho dữ liệu!";
    setTimeout(()=> st.textContent = "", 2500);
  });

  document.getElementById("srcFileBtn").addEventListener("click", async ()=>{
    const fileInput = document.getElementById("srcFile");
    const f = fileInput ? fileInput.files[0] : null;
    const st = document.getElementById("srcStatus");
    const srcTextEl = document.getElementById("srcText");
    if(!f){
      if(st){ st.textContent="Vui lòng chọn một file trước."; st.className="status err"; }
      return;
    }
    
    if(st){ st.className="status loading"; st.textContent="Đang trích xuất nội dung file..."; }
    
    const autoFillTitle = (fileName) => {
      const titleClean = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      const targetFields = ["f_bai", "f_bai_hoc", "f_chude", "f_tieu_de_de", "f_ten_nv"];
      for (const fid of targetFields) {
        const el = document.getElementById(fid);
        if (el && !el.value.trim()) {
          el.value = titleClean;
          break;
        }
      }
      const fNguon = document.getElementById("f_nguon");
      if (fNguon && !fNguon.value.trim()) {
        fNguon.value = sourceText;
      }
    };

    if(isGasEnv()){
      const reader = new FileReader();
      reader.onload = function(){
        const base64 = reader.result.split(",")[1];
        google.script.run
          .withSuccessHandler(text=>{
            sourceText = (sourceText ? sourceText + "\n\n" : "") + text;
            if(srcTextEl) srcTextEl.value = sourceText;
            autoFillTitle(f.name);
            if(st){ st.className="status ok"; st.textContent = "✓ Đã trích xuất " + text.length.toLocaleString() + " ký tự."; }
          })
          .withFailureHandler(err=>{
            if(st){ st.className="status err"; st.textContent="Lỗi: " + (err.message||err); }
          })
          .extractFromFile(base64, f.type, f.name);
      };
      reader.readAsDataURL(f);
      return;
    }

    // Client-side extraction for Browser environment
    if(f.type.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".md") || f.name.endsWith(".json") || f.name.endsWith(".tex")){
      const tr = new FileReader();
      tr.onload = function(e){
        const txt = e.target.result;
        sourceText = (sourceText ? sourceText + "\n\n" : "") + txt;
        if(srcTextEl) srcTextEl.value = sourceText;
        autoFillTitle(f.name);
        if(st){ st.className="status ok"; st.textContent = "✓ Đã đọc " + txt.length.toLocaleString() + " ký tự từ file text."; }
      };
      tr.onerror = function(err){
        if(st){ st.className="status err"; st.textContent="Lỗi đọc file: " + err.message; }
      };
      tr.readAsText(f);
    } else if(f.name.endsWith(".docx") || f.name.endsWith(".doc")){
      if(typeof mammoth !== "undefined"){
        const reader = new FileReader();
        reader.onload = function(e){
          const arrayBuffer = e.target.result;
          mammoth.extractRawText({arrayBuffer: arrayBuffer})
            .then(function(result){
              const text = result.value;
              sourceText = (sourceText ? sourceText + "\n\n" : "") + text;
              if(srcTextEl) srcTextEl.value = sourceText;
              autoFillTitle(f.name);
              if(st){ st.className="status ok"; st.textContent = "✓ Đã trích xuất " + text.length.toLocaleString() + " ký tự từ file Word (.docx)."; }
            })
            .catch(function(err){
              if(st){ st.className="status err"; st.textContent="Lỗi đọc file Word: " + err.message; }
            });
        };
        reader.onerror = function(err){
          if(st){ st.className="status err"; st.textContent="Lỗi đọc file Word: " + err.message; }
        };
        reader.readAsArrayBuffer(f);
      } else {
        if(st){ st.className="status err"; st.textContent="Thư viện Mammoth chưa sẵn sàng. Vui lòng thử lại sau giây lát."; }
      }
    } else if(f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf"){
      // Trích xuất văn bản PDF bằng pdf.js (Client-side offline)
      const tryPdfJs = async () => {
        if(typeof pdfjsLib !== "undefined"){
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for(let i = 1; i <= pdf.numPages; i++){
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(" ");
              if(pageText.trim()){
                fullText += `--- Trang ${i} ---\n` + pageText + "\n\n";
              }
            }
            if(fullText.trim().length > 30){
              sourceText = (sourceText ? sourceText + "\n\n" : "") + fullText.trim();
              if(srcTextEl) srcTextEl.value = sourceText;
              autoFillTitle(f.name);
              if(st){
                st.className="status ok"; 
                st.textContent = "✓ Đã trích xuất " + fullText.trim().length.toLocaleString() + " ký tự từ PDF (" + pdf.numPages + " trang).";
              }
              return true;
            }
          } catch(pdfErr){
            console.warn("PDF.js text extract fallback to Gemini OCR:", pdfErr);
          }
        }
        return false;
      };

      tryPdfJs().then(async success => {
        if(success) return;
        
        // Fallback sang Gemini Vision OCR nếu PDF là dạng ảnh quét (scanned PDF)
        const key = getLocalApiKey();
        if(!key){
          if(st){
            st.className="status err";
            st.textContent="File PDF dạng ảnh quét. Vui lòng cài đặt API key Gemini để thực hiện OCR.";
          }
          if(document.getElementById("settingsBtn")) document.getElementById("settingsBtn").click();
          return;
        }
        if(f.size > 20 * 1024 * 1024){
          if(st){
            st.className="status err";
            st.textContent="Dung lượng PDF quá lớn (>20MB) cho OCR trực tiếp. Vui lòng cắt nhỏ file PDF hoặc dùng file có lớp văn bản.";
          }
          return;
        }
        try {
          const text = await callGeminiVisionOCR(f, "Hãy trích xuất toàn bộ nội dung văn bản, công thức toán và kiến thức học tập trong tài liệu này một cách đầy đủ và chính xác nhất.");
          sourceText = (sourceText ? sourceText + "\n\n" : "") + text;
          if(srcTextEl) srcTextEl.value = sourceText;
          autoFillTitle(f.name);
          if(st){ st.className="status ok"; st.textContent = "✓ Đã trích xuất " + text.length.toLocaleString() + " ký tự bằng Gemini Vision OCR."; }
        } catch(err){
          if(st){ st.className="status err"; st.textContent="Lỗi trích xuất: " + err.message; }
        }
      });
    } else {
      // Image or other binary file OCR via Gemini Vision API
      try {
        const text = await callGeminiVisionOCR(f, "Hãy trích xuất toàn bộ nội dung văn bản, công thức toán và kiến thức học tập trong hình ảnh này một cách đầy đủ và chính xác nhất.");
        sourceText = (sourceText ? sourceText + "\n\n" : "") + text;
        if(srcTextEl) srcTextEl.value = sourceText;
        autoFillTitle(f.name);
        if(st){ st.className="status ok"; st.textContent = "✓ Đã trích xuất " + text.length.toLocaleString() + " ký tự bằng Gemini Vision OCR."; }
      } catch(err){
        if(st){ st.className="status err"; st.textContent="Lỗi trích xuất: " + err.message; }
      }
    }
  });

  document.getElementById("srcLinkBtn").addEventListener("click", async ()=>{
    const url = document.getElementById("srcLink").value.trim();
    const st = document.getElementById("srcStatus");
    if(!url){ st.textContent="Vui lòng dán link liên kết trước."; st.className="status err"; return; }
    
    st.className="status loading"; st.textContent="Đang tải nội dung từ link...";
    if(isGasEnv()){
      google.script.run
        .withSuccessHandler(text=>{
          sourceText = (sourceText ? sourceText + "\n\n" : "") + text;
          srcTextEl.value = sourceText;
          st.className="status ok"; st.textContent = "✓ Đã lấy " + text.length + " ký tự từ link.";
        })
        .withFailureHandler(err=>{
          st.className="status err"; st.textContent="Lỗi: " + (err.message||err);
        })
        .extractFromUrl(url);
    } else {
      st.className="status"; st.textContent="Chế độ trực tiếp: Vui lòng copy/paste trực tiếp văn bản từ trang web vào ô dưới.";
    }
  });
}

/* --- RENDER FORM AREA --- */
function renderForm(){
  const area = document.getElementById("formArea");
  if(!area) return;
  area.innerHTML = "";
  
  if(currentTool.isInfo){
    area.innerHTML = `
      <div class="info-card">
        <h3>🛡️ Hướng dẫn tạo nhiều tài khoản thử nghiệm AI An Toàn (Không dùng trang web rác)</h3>
        <p style="font-size:13px;color:var(--chalk-dim);line-height:1.6;margin-bottom:12px;">
          Cảnh báo: Các trang mail ảo trôi nổi trên mạng thường chứa nhiều quảng cáo không lành mạnh, chuyển hướng độc hại và đa số đã bị ChatGPT/Google chặn. Dưới đây là phương pháp <strong>Gmail Alias (Email phụ chính chủ)</strong> an toàn 100%, hoàn toàn miễn phí và nhận thư ngay trong hòm thư gốc của bạn:
        </p>
        <ol>
          <li><strong>Quy tắc Gmail Alias:</strong> Nếu email của bạn là <code>tengiaovien@gmail.com</code>, bạn chỉ cần thêm dấu <code>+</code> và từ bất kỳ đằng sau. Ví dụ: <code>tengiaovien+chatgpt1@gmail.com</code>, <code>tengiaovien+gemini2@gmail.com</code>.</li>
          <li><strong>Đăng ký tài khoản AI:</strong> Sử dụng địa chỉ email phụ dạng <code>tengiaovien+ai1@gmail.com</code> để đăng ký tại <a href="https://chatgpt.com/" target="_blank" rel="noopener">chatgpt.com</a> hoặc <a href="https://aistudio.google.com/" target="_blank" rel="noopener">aistudio.google.com</a>.</li>
          <li><strong>Nhận mã xác thực (OTP):</strong> Tất cả thư xác thực sẽ gửi trực tiếp về hộp thư chính <code>tengiaovien@gmail.com</code> của bạn ngay lập tức mà không cần qua bất kỳ trang web trung gian nào.</li>
          <li><strong>Quản lý dễ dàng:</strong> Bạn có thể tạo vô số tài khoản thử nghiệm khác nhau (<code>+ai1</code>, <code>+ai2</code>, <code>+test3</code>...) mà vẫn hoàn toàn bảo mật và an toàn.</li>
        </ol>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="btn btn-primary btn-sm">🔑 Đăng ký lấy API Key Gemini (Miễn phí)</a>
          <a href="https://chatgpt.com/" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="color:var(--yellow);border-color:rgba(242,193,78,0.5);">💬 Đăng ký ChatGPT OpenAI</a>
        </div>
      </div>`;
    const outputWrap = document.getElementById("outputWrap");
    if(outputWrap) outputWrap.style.display = "none";
    return;
  }

  const savedValues = formValuesCache[currentTool.id] || {};
  const cardContainer = document.createElement("div");
  cardContainer.style.cssText = "background:var(--card-bg);border:1px solid var(--line);border-radius:14px;padding:24px;box-shadow:var(--card-shadow);margin-bottom:24px;";

  const form = document.createElement("form");
  form.id = "mainToolForm";

  // Top Form Header Bar with Title & Quick Action Buttons
  const formHeader = document.createElement("div");
  formHeader.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:14px;border-bottom:1px dashed var(--line);flex-wrap:wrap;gap:10px;";
  formHeader.innerHTML = `
    <div style="font-weight:700;font-size:14.5px;color:var(--chalk);display:flex;align-items:center;gap:6px;">
      📝 Thông số nhập liệu: <span style="color:var(--yellow);">${escapeHtml(currentTool.name)}</span>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <button class="btn btn-primary btn-sm top-gen-btn" type="button" style="font-size:12.5px;padding:8px 16px;">✨ Tạo prompt</button>
      <button class="btn btn-ghost btn-sm top-copy-btn" type="button" style="font-size:12.5px;color:var(--yellow);border-color:rgba(242,193,78,0.5);">📋 Copy Prompt</button>
    </div>`;
  form.appendChild(formHeader);

  // Build sequential elements list (preserving field order)
  const fields = currentTool.fields || [];
  let i = 0;
  while(i < fields.length){
    const f = fields[i];
    if(f.row){
      const rowName = f.row;
      const rowFields = [];
      while(i < fields.length && fields[i].row === rowName){
        rowFields.push(fields[i]);
        i++;
      }
      const rowDiv = document.createElement("div");
      rowDiv.className = rowFields.length === 2 ? "row2" : (rowFields.length === 3 ? "row3" : "row4");
      rowFields.forEach(rf => {
        rowDiv.appendChild(createFieldElement(rf, savedValues));
      });
      form.appendChild(rowDiv);
    } else {
      form.appendChild(createFieldElement(f, savedValues));
      i++;
    }
  }

  // Bottom Actions Bar
  const actions = document.createElement("div");
  actions.className = "actions";
  actions.style.cssText = "margin-top:22px;padding-top:18px;border-top:1px dashed var(--line);display:flex;gap:12px;align-items:center;flex-wrap:wrap;";
  actions.innerHTML = `
    <button class="btn btn-primary" id="genBtn" type="button" style="font-size:14px;padding:11px 24px;">✨ Tạo prompt</button>
    <button class="btn btn-ghost" id="copyFormPromptBtn" type="button" style="font-size:14px;padding:11px 18px;color:var(--yellow);border-color:rgba(242,193,78,0.5);">📋 Copy Prompt</button>
    <span class="status" id="genStatus"></span>`;
  form.appendChild(actions);

  cardContainer.appendChild(form);
  area.appendChild(cardContainer);

  document.getElementById("genBtn").addEventListener("click", onGenerate);

  const topGenBtn = formHeader.querySelector(".top-gen-btn");
  if(topGenBtn){
    topGenBtn.addEventListener("click", onGenerate);
  }

  const copyFormBtn = document.getElementById("copyFormPromptBtn");
  if(copyFormBtn){
    copyFormBtn.addEventListener("click", handleCopyFormPrompt);
  }

  const topCopyBtn = formHeader.querySelector(".top-copy-btn");
  if(topCopyBtn){
    topCopyBtn.addEventListener("click", handleCopyFormPrompt);
  }

  if(sourceText){
    const fNguon = document.getElementById("f_nguon");
    if(fNguon && !fNguon.value) fNguon.value = sourceText;
  }

  // Tự động điền số câu theo Preset Công văn 7991 (Tool 05)
  if(currentTool && currentTool.id === "de-22-cau"){
    const fMauDe = document.getElementById("f_mau_de");
    if(fMauDe){
      fMauDe.addEventListener("change", (e)=>{
        const val = e.target.value;
        const fP1 = document.getElementById("f_p1");
        const fP2 = document.getElementById("f_p2");
        const fP3 = document.getElementById("f_p3");
        const fP4 = document.getElementById("f_p4");
        const fTime = document.getElementById("f_thoi_gian");
        if(val.includes("28 câu")){
          if(fP1) fP1.value = 18;
          if(fP2) fP2.value = 4;
          if(fP3) fP3.value = 6;
          if(fP4) fP4.value = 0;
          if(fTime) fTime.value = "50 phút";
        } else if(val.includes("Kết hợp")){
          if(fP1) fP1.value = 12;
          if(fP2) fP2.value = 2;
          if(fP3) fP3.value = 2;
          if(fP4) fP4.value = 2;
          if(fTime) fTime.value = "90 phút";
        } else if(val.includes("thường xuyên")){
          if(fP1) fP1.value = 8;
          if(fP2) fP2.value = 2;
          if(fP3) fP3.value = 2;
          if(fP4) fP4.value = 0;
          if(fTime) fTime.value = "45 phút";
        } else if(val.includes("22 câu")){
          if(fP1) fP1.value = 12;
          if(fP2) fP2.value = 4;
          if(fP3) fP3.value = 6;
          if(fP4) fP4.value = 0;
          if(fTime) fTime.value = "90 phút";
        }
      });
    }

    // Nút biên dịch trực tiếp từ tài liệu nguồn trích xuất sang giao diện Đề thi chuẩn CV 7991
    const compileDirectBtn = document.createElement("button");
    compileDirectBtn.className = "btn btn-ghost";
    compileDirectBtn.id = "compileDirectBtn";
    compileDirectBtn.type = "button";
    compileDirectBtn.style.cssText = "font-size:13.5px;padding:11px 18px;color:#2563EB;border-color:rgba(37,99,235,0.5);";
    compileDirectBtn.innerHTML = "⚡ Biên dịch đề từ nội dung trích xuất";
    compileDirectBtn.title = "Biên dịch ngay đề thi chuẩn CV 7991 từ tài liệu nguồn mà không cần gọi AI";
    const statusEl = document.getElementById("genStatus");
    if(statusEl){
      actions.insertBefore(compileDirectBtn, statusEl);
    } else {
      actions.appendChild(compileDirectBtn);
    }

    compileDirectBtn.addEventListener("click", ()=>{
      const v = collectValues();
      const content = (v.nguon && v.nguon.trim()) || (sourceText && sourceText.trim()) || (v.chude && v.chude.trim());
      if(!content){
        alert("Vui lòng đính kèm file hoặc dán nội dung trích xuất đề thi vào ô 'Tài liệu nguồn' trước khi bấm biên dịch.");
        return;
      }
      window.__lastOutput = content;
      window.__lastFilename = "de-thi-cv7991.json";
      window.__lastType = "json";
      window.__lastFormValues = v;
      window.__lastToolId = "de-22-cau";

      const outputWrap = document.getElementById("outputWrap");
      const outputText = document.getElementById("outputText");
      const wsWrap = document.getElementById("worksheetPreview");
      const viewTabs = document.getElementById("viewTabs");

      if(outputWrap) outputWrap.style.display = "block";
      if(viewTabs) viewTabs.style.display = "flex";
      if(outputText){
        outputText.textContent = content;
        outputText.style.display = "none";
      }
      if(wsWrap) wsWrap.style.display = "block";

      const tabPreview = document.getElementById("tabPreview");
      if(tabPreview){
        tabPreview.textContent = "👁 Xem Đề thi A4 chuẩn";
        tabPreview.style.display = "inline-block";
      }
      setActiveTab("tabPreview");

      renderUniversalVisualView("de-22-cau", content, v, false);

      const status = document.getElementById("genStatus");
      if(status){
        status.className = "status ok";
        status.textContent = "✓ Đã biên dịch đề thi thành công từ nội dung trích xuất!";
        setTimeout(()=> { if(status.textContent.includes("thành công")) status.textContent = ""; }, 3000);
      }
    });
  }
}

function createFieldElement(f, savedValues){
  const val = savedValues[f.key] !== undefined ? savedValues[f.key] : (f.default !== undefined ? f.default : "");
  const reqBadge = f.required ? `<span class="req">*</span>` : "";
  
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.id = `field_wrap_${f.key}`;

  let fieldHtml = "";
  if(f.type === "checkbox"){
    const checked = val ? "checked" : "";
    fieldHtml = `
      <div class="checkline">
        <input type="checkbox" id="f_${f.key}" ${checked}>
        <label for="f_${f.key}">${f.label}</label>
      </div>`;
  } else if(f.type === "select"){
    const optionsHtml = (f.options || []).map(o => `<option value="${escapeHtml(o)}" ${String(o) === String(val) ? "selected" : ""}>${escapeHtml(o)}</option>`).join("");
    fieldHtml = `
      <label for="f_${f.key}">${f.label}${reqBadge}</label>
      <select id="f_${f.key}">${optionsHtml}</select>`;
  } else if(f.type === "textarea"){
    const textVal = val !== undefined ? val : "";
    fieldHtml = `
      <label for="f_${f.key}">${f.label}${reqBadge}</label>
      <textarea id="f_${f.key}" placeholder="${escapeHtml(f.placeholder||"")}">${escapeHtml(textVal)}</textarea>`;
  } else {
    const inputVal = val !== undefined ? val : "";
    fieldHtml = `
      <label for="f_${f.key}">${f.label}${reqBadge}</label>
      <input type="${f.type}" id="f_${f.key}" value="${escapeHtml(inputVal)}" placeholder="${escapeHtml(f.placeholder||"")}">`;
  }

  if(f.hint){
    fieldHtml += `<div class="hint">${escapeHtml(f.hint)}</div>`;
  }

  wrap.innerHTML = fieldHtml;
  return wrap;
}

function handleCopyFormPrompt(){
  const v = collectValues();
  formValuesCache[currentTool.id] = v;

  let sysPrompt = "";
  if(typeof currentTool.system === "function"){
    sysPrompt = currentTool.system(v);
  } else if(typeof currentTool.system === "object"){
    sysPrompt = JSON.stringify(currentTool.system, null, 2);
  } else {
    sysPrompt = currentTool.system || "";
  }

  let userPrompt = "";
  if(typeof currentTool.buildUser === "function"){
    userPrompt = currentTool.buildUser(v);
  }

  const fullPrompt = (sysPrompt ? sysPrompt + "\n\n" : "") + userPrompt;
  copyToClipboard(fullPrompt).then(()=>{
    const st = document.getElementById("genStatus");
    if(st){
      st.className = "status ok";
      st.textContent = "✓ Đã copy toàn bộ nội dung Prompt vào bộ nhớ tạm!";
      setTimeout(()=> st.textContent = "", 2500);
    }
  });
}

function collectValues(){
  if(!currentTool || !currentTool.fields) return {};
  const v = {};
  currentTool.fields.forEach(f=>{
    const el = document.getElementById("f_" + f.key);
    if(!el) return;
    if(f.type === "checkbox") v[f.key] = el.checked;
    else if(f.type === "number") v[f.key] = Number(el.value);
    else v[f.key] = el.value.trim();
  });
  return v;
}

/* --- BỘ XỬ LÝ & BÓC TÁCH JSON THÔNG MINH (CHỐNG LỖI ESCAPE LATEX TOÁN HỌC) --- */
function safeParseJsonWithLatex(text){
  if(!text) return null;
  if(typeof text === "object" && text !== null) return text;
  let str = String(text).trim();

  // 1. Tách khối code block ```json ... ``` hoặc ``` ... ``` nếu có
  const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  let candidate = codeBlockMatch ? codeBlockMatch[1].trim() : str;

  // 2. Tìm cặp ngoặc nhọn lớn nhất { ... }
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if(firstBrace !== -1 && lastBrace > firstBrace){
    candidate = candidate.substring(firstBrace, lastBrace + 1);
  }

  // Thử parse trực tiếp
  try {
    return JSON.parse(candidate);
  } catch(e){}

  // 3. Khử lỗi escape trong LaTeX toán học & cú pháp JSON
  function sanitizeJson(raw){
    let s = raw;
    // Khử \frac thành \\frac (vì \f là Form Feed trong JSON tiêu chuẩn)
    s = s.replace(/\\frac/g, "\\\\frac");
    // Khử mọi ký tự \ không theo sau bởi escape hợp lệ của JSON: ", \, /, b, f, n, r, t, uXXXX
    s = s.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    // Xóa dấu phẩy thừa trước dấu } hoặc ]
    s = s.replace(/,\s*([}\]])/g, "$1");
    return s;
  }

  try {
    return JSON.parse(sanitizeJson(candidate));
  } catch(e){}

  // 4. Khắc phục JSON bị cắt cụt do giới hạn token (tự động đóng ngoặc)
  try {
    let sanitized = sanitizeJson(candidate);
    let openCurly = 0, openSquare = 0, inString = false, escape = false;
    for(let i = 0; i < sanitized.length; i++){
      const c = sanitized[i];
      if(escape){ escape = false; continue; }
      if(c === "\\"){ escape = true; continue; }
      if(c === '"'){ inString = !inString; continue; }
      if(!inString){
        if(c === "{") openCurly++;
        else if(c === "}") openCurly--;
        else if(c === "[") openSquare++;
        else if(c === "]") openSquare--;
      }
    }
    if(inString) sanitized += '"';
    sanitized = sanitized.replace(/,\s*$/, "");
    while(openSquare > 0){ sanitized += "]"; openSquare--; }
    while(openCurly > 0){ sanitized += "}"; openCurly--; }
    return JSON.parse(sanitized);
  } catch(e){}

  return null;
}

/* --- GENERATION EVENT HANDLER --- */
async function onGenerate(){
  const v = collectValues();
  formValuesCache[currentTool.id] = v;
  
  for(const f of (currentTool.fields || [])){
    if(f.required && (!v[f.key] || !String(v[f.key]).trim())){
      const statusEl = document.getElementById("genStatus");
      const cleanLabel = f.label.replace(/\*/g, "").trim();
      statusEl.textContent = "Vui lòng điền trường bắt buộc: " + cleanLabel;
      statusEl.className = "status err";
      const targetInput = document.getElementById("f_" + f.key);
      if(targetInput){
        targetInput.focus();
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  }
  
  const btn = document.getElementById("genBtn");
  const status = document.getElementById("genStatus");
  if(btn){
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Đang tạo prompt...`;
  }
  if(status){
    status.className = "status loading";
    status.textContent = "Đang gửi yêu cầu tới Gemini API...";
  }

  const outputWrap = document.getElementById("outputWrap");
  const outputText = document.getElementById("outputText");
  const mathPreview = document.getElementById("mathPreview");
  const previewFrame = document.getElementById("previewFrame");
  const viewTabs = document.getElementById("viewTabs");
  const beautifyBtn = document.getElementById("beautifyBtn");
  
  if(outputWrap) outputWrap.style.display = "block";
  if(previewFrame) previewFrame.style.display = "none";
  if(mathPreview) mathPreview.style.display = "none";
  if(outputText){
    outputText.style.display = "block";
    outputText.textContent = "Đang sinh nội dung prompt...";
  }
  
  if(document.getElementById("tabText")) document.getElementById("tabText").classList.add("active");
  if(document.getElementById("tabMath")) document.getElementById("tabMath").classList.remove("active");
  if(document.getElementById("tabPreview")) document.getElementById("tabPreview").classList.remove("active");
  if(document.getElementById("tabCode")) document.getElementById("tabCode").classList.remove("active");
  
  if(viewTabs) viewTabs.style.display = "flex";
  if(beautifyBtn) beautifyBtn.style.display = "none";

  try {
    const key = getLocalApiKey();
    if(!isGasEnv() && !key){
      if(document.getElementById("settingsBtn")) document.getElementById("settingsBtn").click();
      throw new Error("Chưa có API key Gemini. Vui lòng dán API key của bạn vào cửa sổ Cài đặt vừa mở.");
    }

    const system = typeof currentTool.system === "function" ? currentTool.system(v) : currentTool.system;
    const sysStr = typeof system === "string" ? system : JSON.stringify(system, null, 2);
    
    let userMsg = currentTool.buildUser ? currentTool.buildUser(v) : "";
    
    if(sourceText && sourceText.trim() && (!v.nguon || !v.nguon.includes(sourceText.trim()))){
      userMsg = "TÀI LIỆU NGUỒN (Bám sát nội dung này, không lấy ngoài nguồn):\n\"\"\"\n" + sourceText.trim() + "\n\"\"\"\n\n" + userMsg;
    }

    const outType = currentTool.outputTypeFor ? currentTool.outputTypeFor(v) : currentTool.outputType;
    const targetFilename = currentTool.filenameFor ? currentTool.filenameFor(v) : (currentTool.filename || "prompt.txt");

    const fullResult = await generatePromptContent(sysStr, userMsg, (msg)=>{
      if(status) status.textContent = msg;
    });

    let cleaned = fullResult.trim();
    let parsed = null;

    if(outType === "json"){
      parsed = safeParseJsonWithLatex(fullResult);
      if(parsed){
        cleaned = JSON.stringify(parsed, null, 2);
        if(beautifyBtn) beautifyBtn.style.display = "inline-flex";
      } else {
        const cbMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        cleaned = cbMatch ? cbMatch[1].trim() : cleaned;
      }
    } else if(outType === "html"){
      if(cleaned.startsWith("```html") && cleaned.endsWith("```")){
        cleaned = cleaned.replace(/^```html\s*/i, "").replace(/\s*```$/i, "").trim();
      } else if(cleaned.startsWith("```") && cleaned.endsWith("```")){
        cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "").trim();
      }
    } else {
      if(cleaned.startsWith("```") && cleaned.endsWith("```")){
        cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/i, "").replace(/\s*```$/i, "").trim();
      }
    }

    window.__lastOutput = cleaned;
    window.__lastFilename = targetFilename;
    window.__lastType = outType;
    window.__lastFormValues = v;
    window.__lastToolId = currentTool.id;

    updateTokenCount(cleaned);

    const wsWrap = document.getElementById("worksheetPreview");

    if(outType === "html"){
      const match = cleaned.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
      const htmlCode = match ? match[0] : cleaned;
      window.__lastHtmlCode = htmlCode;
      
      const tabPreview = document.getElementById("tabPreview");
      if(tabPreview){
        tabPreview.textContent = "👁 Xem trước giao diện";
        tabPreview.style.display = "inline-block";
      }
      if(document.getElementById("tabCode")) document.getElementById("tabCode").style.display = "inline-block";
      
      if(viewTabs) viewTabs.style.display = "flex";
      setActiveTab("tabPreview");
      
      if(outputText) outputText.style.display = "none";
      if(wsWrap) wsWrap.style.display = "none";
      if(previewFrame){
        previewFrame.style.display = "block";
        previewFrame.srcdoc = htmlCode;
      }
      if(outputText) outputText.textContent = htmlCode;
    } else {
      // Universal Visual Compiler Detection for all tools
      let isVisualTool = false;

      const visualTools = ["phieu-hoc-tap", "de-22-cau", "mindmap", "truyen-tranh", "geogebra", "toan-tieng-anh-clil", "tao-nhan-vat", "video-veo3", "tao-poster-quoc-khanh", "giai-de-dap-an"];
      if(currentTool && visualTools.includes(currentTool.id)){
        isVisualTool = true;
      }

      if(isVisualTool){
        const tabPreview = document.getElementById("tabPreview");
        if(tabPreview){
          if(currentTool.id === "phieu-hoc-tap") tabPreview.textContent = "👁 Xem phiếu học tập trực quan";
          else if(currentTool.id === "de-22-cau") tabPreview.textContent = "👁 Xem Đề thi A4 chuẩn";
          else if(currentTool.id === "mindmap") tabPreview.textContent = "👁 Xem Sơ đồ tư duy trực quan";
          else if(currentTool.id === "truyen-tranh") tabPreview.textContent = "👁 Xem Truyện tranh tương tác";
          else if(currentTool.id === "geogebra") tabPreview.textContent = "👁 Chạy & Xem hình GeoGebra";
          else if(currentTool.id === "toan-tieng-anh-clil") tabPreview.textContent = "👁 Thẻ học Song ngữ CLIL";
          else if(currentTool.id === "tao-nhan-vat") tabPreview.textContent = "👁 Hồ sơ nhân vật trực quan";
          else if(currentTool.id === "video-veo3") tabPreview.textContent = "👁 Storyboard phân cảnh";
          else if(currentTool.id === "tao-poster-quoc-khanh") tabPreview.textContent = "👁 Poster trực quan";
          else if(currentTool.id === "giai-de-dap-an") tabPreview.textContent = "👁 Sổ tay Đáp án & Barem điểm";
          else tabPreview.textContent = "👁 Xem trước trực quan";
          tabPreview.style.display = "inline-block";
        }
        if(document.getElementById("tabCode")) document.getElementById("tabCode").style.display = "none";
        
        renderUniversalVisualView(currentTool.id, parsed || cleaned, v, false);
        setActiveTab("tabPreview");
        
        if(outputText){
          outputText.textContent = cleaned;
          outputText.style.display = "none";
        }
        if(previewFrame) previewFrame.style.display = "none";
        if(wsWrap) wsWrap.style.display = "block";
      } else {
        if(document.getElementById("tabPreview")) document.getElementById("tabPreview").style.display = "none";
        if(document.getElementById("tabCode")) document.getElementById("tabCode").style.display = "none";
        if(wsWrap) wsWrap.style.display = "none";
        if(outputText){
          outputText.textContent = cleaned;
          outputText.style.display = "block";
        }
        if(previewFrame) previewFrame.style.display = "none";
        setActiveTab("tabText");

        // Ẩn nút biên dịch ảnh trực tiếp đối với công cụ toán thực tế
        const renderAiImgBtn = document.getElementById("renderAiImgBtn");
        if(renderAiImgBtn && currentTool.id === "toan-thuc-te"){
          renderAiImgBtn.style.display = "none";
        }
      }
    }

    if(status){
      status.className = "status ok";
      status.textContent = (currentTool && currentTool.id === "toan-thuc-te")
        ? "✓ Đã tạo Prompt Toán thực tế dạng code! Bạn có thể bấm '📋 Sao chép' để dán vào Gemini / ChatGPT tạo ảnh, hoặc bấm '📄 Xuất file Word (.doc)'."
        : "✓ Hoàn tất tạo prompt!";
    }
    
    saveHistoryLog(currentTool.title, JSON.stringify(v), cleaned.slice(0, 400));
    if(outputWrap) outputWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch(err){
    if(status){
      status.className = "status err";
      status.textContent = "Lỗi: " + err.message;
    }
    if(outputText) outputText.textContent = "Đã xảy ra lỗi:\n" + err.message;
    if(err.message && err.message.includes("API key")){
      if(document.getElementById("settingsBtn")) document.getElementById("settingsBtn").click();
    }
  } finally {
    if(btn){
      btn.disabled = false;
      btn.innerHTML = "✨ Tạo prompt";
    }
  }
}

function updateTokenCount(str){
  const el = document.getElementById("tokenStatus");
  if(!el) return;
  const len = str.length;
  const words = str.trim().split(/\s+/).filter(Boolean).length;
  el.textContent = `Độ dài: ${len.toLocaleString()} ký tự · ~${words.toLocaleString()} từ`;
}

/* --- TABS HANDLER --- */
function setActiveTab(activeId){
  ["tabText", "tabMath", "tabPreview", "tabCode"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.classList.toggle("active", id === activeId);
  });
}

document.getElementById("tabText").addEventListener("click", ()=>{
  setActiveTab("tabText");
  document.getElementById("outputText").style.display = "block";
  document.getElementById("mathPreview").style.display = "none";
  document.getElementById("previewFrame").style.display = "none";
  const wsWrap = document.getElementById("worksheetPreview");
  if(wsWrap) wsWrap.style.display = "none";
});

document.getElementById("tabMath").addEventListener("click", ()=>{
  setActiveTab("tabMath");
  document.getElementById("outputText").style.display = "none";
  document.getElementById("previewFrame").style.display = "none";
  const wsWrap = document.getElementById("worksheetPreview");
  if(wsWrap) wsWrap.style.display = "none";
  const mathEl = document.getElementById("mathPreview");
  mathEl.style.display = "block";
  mathEl.innerHTML = window.__lastOutput ? escapeHtml(window.__lastOutput).replace(/\n/g, "<br>") : "";
  if(window.MathJax && window.MathJax.typesetPromise){
    window.MathJax.typesetPromise([mathEl]).catch(err=>console.error("MathJax err:", err));
  }
});

document.getElementById("tabPreview").addEventListener("click", ()=>{
  setActiveTab("tabPreview");
  document.getElementById("outputText").style.display = "none";
  document.getElementById("mathPreview").style.display = "none";
  const wsWrap = document.getElementById("worksheetPreview");
  if(wsWrap && wsWrap.innerHTML.trim()){
    wsWrap.style.display = "block";
    document.getElementById("previewFrame").style.display = "none";
  } else {
    document.getElementById("previewFrame").style.display = "block";
    if(wsWrap) wsWrap.style.display = "none";
  }
});

document.getElementById("tabCode").addEventListener("click", ()=>{
  setActiveTab("tabCode");
  document.getElementById("previewFrame").style.display = "none";
  const wsWrap = document.getElementById("worksheetPreview");
  if(wsWrap) wsWrap.style.display = "none";
  document.getElementById("outputText").style.display = "block";
  document.getElementById("mathPreview").style.display = "none";
});

/* ==========================================================================
   UNIVERSAL AI IMAGE COMPILER (PROMPT SYNTHESIZER FOR ALL TOOLS)
   ========================================================================== */
function compileUniversalImagePrompt(toolId, data, formValues){
  // 1. If explicit ai_image_prompt exists in JSON output
  if(data && typeof data === "object" && data.ai_image_prompt && String(data.ai_image_prompt).trim().length > 25){
    return String(data.ai_image_prompt).trim();
  }

  const mon = (data && data.subject) || (formValues && formValues.mon) || "Toán";
  const lop = (data && data.grade) || (formValues && formValues.lop) || "Lớp 12";
  const chude = (data && (data.topic || data.title || data.lesson_title)) || (formValues && (formValues.chude || formValues.bai || formValues.bai_hoc || formValues.yeucau)) || "Chuyên đề bài học";
  const tile = (formValues && (formValues.tile || formValues.ty_le)) || (data && (data.aspect_ratio || data.ty_le)) || "9:16";

  // Tool 02: Phiếu học tập
  if(toolId === "phieu-hoc-tap"){
    const layout = (formValues && formValues.mau_trinh_bay) || "";
    let layoutDesc = "clean multi-station educational infographic worksheet poster with vector icons";
    let colorMood = "harmonious pedagogical color palette";
    if(layout.includes("Tiểu học") || layout.includes("Pastel")){
      layoutDesc = "cute playful children worksheet, soft pastel colors, cartoon stickers, friendly animal mascots, rounded cards";
      colorMood = "warm pastel yellow, soft mint green and baby blue";
    } else if(layout.includes("THCS") || layout.includes("Gamification")){
      layoutDesc = "gamified quest worksheet poster, RPG game mission stations, XP bars, achievement badges";
      colorMood = "cyber cyan, electric blue, neon orange and deep navy";
    } else if(layout.includes("THPT") || layout.includes("Cornell")){
      layoutDesc = "sophisticated Cornell note-taking infographic worksheet poster, clean 3-section layout, mathematical diagrams";
      colorMood = "slate blue, emerald green and crisp white";
    } else if(layout.includes("STEM") || layout.includes("Lab")){
      layoutDesc = "scientific laboratory experiment worksheet poster, hypothesis to apparatus data grid, scientific lab equipment icons";
      colorMood = "tech teal, lime green and dark slate";
    }
    return `Masterpiece educational infographic worksheet poster about "${chude}" for ${mon} ${lop} students. ${layoutDesc}, pedagogical visual notetaking design, ${colorMood}, crisp layout, high readability, isolated on clean background, 8k resolution, print ready --ar ${tile}`;
  }

  // Tool 05: Đề thi 22 câu
  if(toolId === "de-22-cau"){
    return `An authentic formal high school examination paper poster about "${chude}" for ${mon} ${lop} Vietnamese students. Formal academic paper layout, Ministry of Education style header, 3 distinct sections with multiple choice options, true/false questions, short answer boxes, mathematical LaTeX formulas, geometrical diagrams, clean typography, 8k resolution, print ready --ar ${tile}`;
  }

  // Tool 03: Sơ đồ tư duy
  if(toolId === "mindmap"){
    return `A retro vintage educational mindmap infographic poster about "${chude}" for ${mon} ${lop} students. Central circular title with radiating organic knowledge branches, sub-branches with icons, mathematical diagrams, retro warm paper background, muted vintage color palette, clean typography, A4 format --ar ${tile}`;
  }

  // Tool 06: Bài tập thực tế
  if(toolId === "toan-thuc-te"){
    const style = (formValues && formValues.phongcach) || "Sketchnote, viết mực màu xanh làm chủ đạo";
    if(style.includes("Sketchnote")){
      return `A professional educational sketchnote math worksheet poster in blue ink style illustrating real-world applications of "${chude}" for ${mon} ${lop} students (curriculum: Ket noi tri thuc). 3-column layout: Column 1 problem scenario, Column 2 accurate mathematical diagram and visual sketch, Column 3 ruled lined workspace for students. Clean blue hand-drawn ink linework on textured paper, educational infographic art, high resolution --ar 3:4`;
    }
    return `A modern 3-column educational infographic worksheet poster illustrating real-world applications of "${chude}" for ${mon} ${lop} students. Column 1 practical problem scenario, column 2 technical diagram and mathematical illustration, column 3 structured solution workspace, clean minimalist vector art style, high contrast, 8k resolution --ar 3:4`;
  }

  // Tool 07: Truyện tranh
  if(toolId === "truyen-tranh"){
    const style = (formValues && formValues.phongcach) || "comic";
    return `A dynamic multi-panel educational comic strip about "${chude}", styled in authentic ${style} character art. Expressive characters interacting, colorful speech bubbles explaining key educational concepts, lively backgrounds, clean ink outlines, vibrant storytelling illustration, 8k resolution --ar 16:9`;
  }

  // Tool 01: Video Veo 3 / Storyboard
  if(toolId === "video-veo3"){
    const style = (formValues && formValues.phong_cach) || "cinematic educational";
    return `A cinematic educational scene keyframe illustrating the lesson hook for "${chude}". ${style} aesthetic, engaging characters discovering a real-world scientific phenomenon, dramatic lighting, rich depth of field, high emotional resonance, 8k resolution, movie still --ar ${tile}`;
  }

  // Tool 11: Tạo nhân vật
  if(toolId === "tao-nhan-vat"){
    const name = (formValues && formValues.ten_nv) || "Nhân vật";
    const charStyle = (formValues && formValues.phong_cach) || "3D Pixar";
    const desc = (formValues && formValues.ngoai_hinh) || "friendly teacher/student character";
    return `Character design turnaround sheet and portrait for "${name}", ${charStyle} style. ${desc}, front and 3/4 angle views, consistent facial features, characteristic clothing, warm approachable expression, neutral studio background, 8k resolution, highly detailed character model sheet --ar 3:4`;
  }

  // Tool 16: Poster Sự Kiện / AI Art
  if(toolId === "tao-poster-quoc-khanh"){
    const suKien = (formValues && formValues.su_kien && formValues.su_kien.trim()) || "Quốc khánh Việt Nam 2/9";
    const slogan = (formValues && formValues.text_chinh) || "TỰ HÀO VIỆT NAM";
    const style = (formValues && formValues.phong_cach) || "cinematic patriotic";
    const isNational = /quốc khánh|2\/9|02\/09|dân tộc|yêu nước/i.test(suKien);
    const themeVisual = isNational ? "Waving red flag with golden star, Ba Dinh square or iconic Vietnamese skyline, golden sunrise lighting, heroic patriotic atmosphere" : `Atmospheric celebration of ${suKien}, professional event visual identity, celebratory lighting, inspiring background elements`;
    return `A magnificent ${style} poster celebrating "${suKien}" with bold typography "${slogan}". ${themeVisual}, double exposure portrait blending, 8k resolution, cinematic composition --ar ${tile}`;
  }

  // Tool 10: Song ngữ CLIL
  if(toolId === "toan-tieng-anh-clil"){
    return `A bilingual English-Vietnamese educational vocabulary flashcard poster for "${chude}" in ${mon} ${lop}. Clean modern layout, illustrated math/science concept, English keyword with phonetic IPA, Vietnamese translation, example sentence bubble, vivid colors, educational graphic design --ar 3:4`;
  }

  // Fallback general educational poster
  return `A high quality educational infographic poster about "${chude}" for ${mon} ${lop} students. Clean vector illustrations, clear typography, harmonious color palette, high readability, 8k resolution --ar ${tile}`;
}

/* ==========================================================================
   TOOL 02: NATIVE WORKSHEET COMPILER
   ========================================================================== */
function compileWorksheetToHtml(data, formValues, showSolutions = false){
  const ws = (data && data.worksheet) ? data.worksheet : (data || {});
  const topic = data.topic || (formValues && formValues.chude) || ws.subtitle || "Bài học";
  const mon = data.subject || (formValues && formValues.mon) || "Môn học";
  const lop = data.grade || (formValues && formValues.lop) || "Khối lớp";
  const layout = (formValues && formValues.mau_trinh_bay) || data.layout_style || "";

  let themeClass = "";
  if(layout.includes("Tiểu học") || layout.includes("Pastel")) themeClass = "ws-theme-pastel";
  else if(layout.includes("THCS") || layout.includes("Gamification")) themeClass = "ws-theme-gamification";
  else if(layout.includes("THPT") || layout.includes("Cornell")) themeClass = "ws-theme-cornell";
  else if(layout.includes("STEM") || layout.includes("Lab")) themeClass = "ws-theme-stem";

  const title = ws.title || "PHIẾU HỌC TẬP";
  const subtitle = ws.subtitle || topic;
  const schoolHeader = ws.school_header || `TRƯỜNG: ....................................... | NĂM HỌC: 2025 - 2026`;

  // Student info
  let sInfo = ws.student_info;
  let sInfoHtml = "";
  if(sInfo && typeof sInfo === "object" && !Array.isArray(sInfo)){
    sInfoHtml = `
      <div><strong>${escapeHtml(sInfo.name || "Họ và tên: .....................................................")}</strong></div>
      <div><strong>${escapeHtml(sInfo.class || `Lớp: ${lop}`)}</strong></div>
      <div><strong>${escapeHtml(sInfo.date || "Ngày: ...../...../202...")}</strong></div>
      <div><strong>${escapeHtml(sInfo.score || "Điểm số: ......... / 10")}</strong></div>
      <div style="grid-column: 1 / -1;"><em>${escapeHtml(sInfo.teacher_feedback || "Lời nhận xét của thầy cô: ..................................................")}</em></div>
    `;
  } else if(Array.isArray(sInfo)){
    sInfoHtml = sInfo.map(item => `<div><strong>${escapeHtml(String(item))}</strong> ........................</div>`).join("");
  } else {
    sInfoHtml = `
      <div><strong>Họ và tên:</strong> .....................................................</div>
      <div><strong>Lớp:</strong> ${escapeHtml(lop)}</div>
      <div><strong>Ngày:</strong> ...../...../202...</div>
      <div><strong>Điểm số:</strong> ......... / 10</div>
    `;
  }

  // Goals
  let goalsHtml = "";
  if(ws.learning_goals){
    if(Array.isArray(ws.learning_goals)){
      goalsHtml = `
        <div class="ws-goals-box">
          <h4>🎯 Mục tiêu bài học trọng tâm</h4>
          <ul>${ws.learning_goals.map(g => `<li>${escapeHtml(String(g))}</li>`).join("")}</ul>
        </div>
      `;
    } else if(typeof ws.learning_goals === "string"){
      goalsHtml = `
        <div class="ws-goals-box">
          <h4>🎯 Mục tiêu bài học</h4>
          <div>${escapeHtml(ws.learning_goals)}</div>
        </div>
      `;
    }
  }

  // Stations
  const stationIcons = ["🎯", "🔗", "⚖️", "📝", "💡", "🚀", "⭐"];
  let stationsHtml = "";
  const stations = Array.isArray(ws.stations) ? ws.stations : [];
  stations.forEach((st, idx) => {
    const icon = stationIcons[idx % stationIcons.length];
    const sNum = st.station_num || (idx + 1);
    const sName = st.name || `Trạm ${sNum}`;
    const sBadge = st.badge || `Nhiệm vụ ${sNum}`;
    const sInst = st.instruction || st.task || "";

    let bodyHtml = "";
    if(sInst){
      bodyHtml += `<div class="ws-station-instruction">💡 <strong>Yêu cầu:</strong> ${escapeHtml(sInst)}</div>`;
    }

    if(st.pairs && (st.pairs.col_a || st.pairs.col_b)){
      const colA = st.pairs.col_a || [];
      const colB = st.pairs.col_b || [];
      bodyHtml += `
        <div class="ws-match-grid">
          <div class="ws-match-col">
            <div style="font-weight:700;font-size:13px;color:#0284C7;margin-bottom:4px;">📌 CỘT A (Nội dung)</div>
            ${colA.map(a => `
              <div class="ws-match-card">
                <span class="ws-match-key">${escapeHtml(String(a.key || a.num || ""))}</span>
                <span>${escapeHtml(String(a.text || a))}</span>
              </div>
            `).join("")}
          </div>
          <div class="ws-match-col">
            <div style="font-weight:700;font-size:13px;color:#10B981;margin-bottom:4px;">🎯 CỘT B (Kết quả ghép)</div>
            ${colB.map(b => `
              <div class="ws-match-card">
                <span class="ws-match-key" style="background:#10B981;">${escapeHtml(String(b.key || b.letter || ""))}</span>
                <span>${escapeHtml(String(b.text || b))}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div style="margin-top:12px;padding:8px 12px;background:#F1F5F9;border-radius:6px;font-size:13px;">
          <strong>Nối đáp án:</strong> ${colA.map(a => `(${escapeHtml(String(a.key || a.num || ""))} nối với .......)`).join("  ·  ")}
        </div>
      `;
    } else if(Array.isArray(st.items)){
      st.items.forEach((it, iIdx) => {
        if(typeof it === "string"){
          const renderedText = escapeHtml(it).replace(/\[\.\.\.\.\.\.\.\]/g, '<span class="ws-blank-slot">.....................</span>');
          bodyHtml += `<div class="ws-item"><strong>Câu ${iIdx+1}:</strong> ${renderedText}</div>`;
        } else if(typeof it === "object"){
          const qNum = it.num || it.key || (iIdx + 1);
          if(it.options && Array.isArray(it.options)){
            bodyHtml += `
              <div class="ws-item">
                <div><strong>Câu ${qNum}:</strong> ${escapeHtml(it.question || it.text || "")}</div>
                <div class="ws-mcq-grid">
                  ${it.options.map(opt => `<div class="ws-mcq-opt">${escapeHtml(String(opt))}</div>`).join("")}
                </div>
              </div>
            `;
          } else if(it.key && (it.key === "a" || it.key === "b" || it.key === "c" || it.key === "d")){
            bodyHtml += `
              <div class="ws-tf-row">
                <div class="ws-tf-boxes">
                  <div class="ws-tf-box" title="Đúng">Đ</div>
                  <div class="ws-tf-box" title="Sai">S</div>
                </div>
                <div><strong>${escapeHtml(String(it.key))})</strong> ${escapeHtml(it.text || "")}</div>
              </div>
            `;
          } else if(it.sub_questions && Array.isArray(it.sub_questions)){
            bodyHtml += `
              <div class="ws-item">
                <div><strong>Bài ${qNum}:</strong> ${escapeHtml(it.question || it.text || "")}</div>
                ${it.sub_questions.map(sub => `<div style="padding-left:14px;margin:4px 0;"><strong>${escapeHtml(String(sub))}</strong></div>`).join("")}
                <div class="ws-essay-box" title="Phần ghi bài làm của học sinh"></div>
              </div>
            `;
          } else {
            const text = it.text || it.question || JSON.stringify(it);
            const renderedText = escapeHtml(text).replace(/\[\.\.\.\.\.\.\.\]/g, '<span class="ws-blank-slot">.....................</span>');
            bodyHtml += `
              <div class="ws-item">
                <div><strong>Câu ${qNum}:</strong> ${renderedText}</div>
                ${it.hint ? `<div style="font-size:12px;color:#64748B;font-style:italic;margin-top:2px;">Gợi ý: ${escapeHtml(it.hint)}</div>` : ''}
              </div>
            `;
          }
        }
      });
    } else {
      bodyHtml += `<div style="color:#64748B;font-style:italic;">Chưa có nội dung chi tiết cho trạm này.</div>`;
    }

    stationsHtml += `
      <div class="ws-station">
        <div class="ws-station-head">
          <div>${icon} ${escapeHtml(sName)}</div>
          <span class="ws-station-badge">${escapeHtml(sBadge)}</span>
        </div>
        <div class="ws-station-body">${bodyHtml}</div>
      </div>
    `;
  });

  // Footer & Self assessment
  let footerHtml = "";
  const ft = ws.footer;
  if(ft){
    let levels = ["🌱 Cần cố gắng", "🌿 Đã hiểu cơ bản", "🌸 Hoàn thành tốt", "⭐ Rất tự tin & Xuất sắc"];
    let fTitle = "Tự đánh giá mức độ hiểu bài hôm nay:";
    if(ft.self_assessment){
      if(typeof ft.self_assessment === "object" && Array.isArray(ft.self_assessment.levels)){
        levels = ft.self_assessment.levels;
      }
      if(ft.self_assessment.title) fTitle = ft.self_assessment.title;
    }
    const refl = ft.reflection || ft.questions_remaining || "Điều em tâm đắc nhất hoặc còn thắc mắc sau bài học:";

    footerHtml = `
      <div class="ws-footer">
        <div style="font-size:13px;font-weight:700;color:#334155;">${escapeHtml(fTitle)}</div>
        <div class="ws-assessment-wrap">
          ${levels.map(lvl => `<div class="ws-assessment-chip">◻ ${escapeHtml(String(lvl))}</div>`).join("")}
        </div>
        <div style="margin-top:10px;font-size:13px;">
          <strong>💬 ${escapeHtml(refl)}</strong>
          <div style="border-bottom:1px dotted #94A3B8;height:24px;margin-top:4px;"></div>
        </div>
      </div>
    `;
  }

  // Solutions
  let solutionsHtml = "";
  if(showSolutions && data.solutions){
    const sol = data.solutions;
    const solTitle = sol.title || "ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT";
    let answersHtml = "";
    if(Array.isArray(sol.stations_answers)){
      answersHtml = sol.stations_answers.map(sa => `
        <div style="margin-bottom:12px;">
          <div style="font-weight:700;color:#7C3AED;font-size:14px;display:flex;justify-content:space-between;">
            <span>📌 ${escapeHtml(sa.station || "Trạm")}</span>
            <span style="color:#059669;font-size:12.5px;">${escapeHtml(sa.points || "")}</span>
          </div>
          <ul style="margin:4px 0 0;padding-left:20px;font-size:13.5px;">
            ${(sa.details || []).map(d => `<li>${escapeHtml(String(d))}</li>`).join("")}
          </ul>
        </div>
      `).join("");
    } else {
      answersHtml = `<div>${escapeHtml(JSON.stringify(sol, null, 2))}</div>`;
    }

    solutionsHtml = `
      <div class="ws-solutions-container">
        <h3 style="margin:0 0 14px;color:#6D28D9;font-size:17px;font-weight:800;display:flex;align-items:center;gap:8px;">
          <span>🔑 ${escapeHtml(solTitle)}</span>
        </h3>
        ${answersHtml}
      </div>
    `;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>📘 Phiếu Học Tập Infographic</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-ghost btn-sm" id="univToggleSolBtn" style="font-size:12px;color:#0284C7;border-color:rgba(2,132,199,0.4);">
          ${showSolutions ? '👁️ Xem Bản Học Sinh (Ẩn Đáp Án)' : '🔑 Xem Bản Kèm Lời Giải & Thang Điểm'}
        </button>
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn / Xuất PDF (A4)
        </button>
        <button class="btn btn-ghost btn-sm" id="univDownloadHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải file HTML
        </button>
      </div>
    </div>
    <div class="worksheet-container ${themeClass}" id="printableUniversal">
      <div class="ws-school-meta">${escapeHtml(schoolHeader)} · ${escapeHtml(mon)} ${escapeHtml(lop)}</div>
      <div class="ws-header">
        <div class="ws-title">${escapeHtml(title)}</div>
        <div class="ws-subtitle">${escapeHtml(subtitle)}</div>
        <div class="ws-student-box">${sInfoHtml}</div>
      </div>
      ${goalsHtml}
      <div style="margin-bottom:14px;font-style:italic;font-size:13px;color:#64748B;">
        📖 <strong>Hướng dẫn:</strong> ${escapeHtml(ws.instructions || "Đọc kỹ yêu cầu ở từng trạm và hoàn thành bài vào phiếu.")}
      </div>
      ${stationsHtml}
      ${footerHtml}
      ${solutionsHtml}
    </div>
  `;
}

/* ==========================================================================
   TOOL 05: EXAM PAPER COMPILER (ĐỀ KIỂM TRA CHUẨN CÔNG VĂN 7991/BGDĐT-GDTrH)
   ========================================================================== */

// 1. CHUẨN HÓA DỮ LIỆU ĐỀ THI (HỖ TRỢ ĐA DẠNG KEY TỪ GEMINI)
function normalizeExamData(rawObj, formValues){
  if(!rawObj || typeof rawObj !== "object") return null;
  const v = formValues || {};

  const title = rawObj.title || rawObj.tieu_de || rawObj.exam_name || v.tieude || "BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I";
  const mon = rawObj.subject || rawObj.mon || rawObj.mon_hoc || v.mon || "Toán";
  const lop = rawObj.grade || rawObj.lop || rawObj.khoi_lop || v.lop || "Lớp 12";
  const header = rawObj.exam_header || rawObj.header || rawObj.thong_tin_chung || {};

  // Part 1: MCQ
  const p1Raw = rawObj.part1_mcq || rawObj.part1 || rawObj.part_1 || rawObj.phan1 || rawObj.phan_1 || rawObj.phan1_trac_nghiem || rawObj.partI || rawObj.phan_I || {};
  const q1ListRaw = Array.isArray(p1Raw.questions) ? p1Raw.questions : (Array.isArray(p1Raw.cau_hoi) ? p1Raw.cau_hoi : (Array.isArray(p1Raw) ? p1Raw : (Array.isArray(p1Raw.items) ? p1Raw.items : [])));
  const q1List = q1ListRaw.map((q, idx) => {
    if(typeof q === "string") return { num: idx + 1, question: q, options: [] };
    let opts = q.options || q.choices || q.phuong_an || [];
    if(!Array.isArray(opts) && typeof opts === "object" && opts !== null){
      opts = Object.entries(opts).map(([k, val]) => `${k}. ${val}`);
    }
    return {
      num: q.num || q.so_cau || (idx + 1),
      level: q.level || q.muc_do || "",
      question: q.question || q.stem || q.de_bai || q.content || "",
      options: Array.isArray(opts) ? opts : []
    };
  });

  // Part 2: True/False
  const p2Raw = rawObj.part2_true_false || rawObj.part2 || rawObj.part_2 || rawObj.phan2 || rawObj.phan_2 || rawObj.phan2_dung_sai || rawObj.partII || rawObj.phan_II || rawObj.part2_tf || {};
  const q2ListRaw = Array.isArray(p2Raw.questions) ? p2Raw.questions : (Array.isArray(p2Raw.cau_hoi) ? p2Raw.cau_hoi : (Array.isArray(p2Raw) ? p2Raw : (Array.isArray(p2Raw.items) ? p2Raw.items : [])));
  const q2List = q2ListRaw.map((q, idx) => {
    if(typeof q === "string") return { num: idx + 1, stem: q, items: [] };
    let items = q.items || q.sub_questions || q.statements || q.y_hoi || q.options || [];
    let cleanItems = [];
    if(!Array.isArray(items) && typeof items === "object" && items !== null){
      cleanItems = Object.entries(items).map(([k, val]) => {
        if(typeof val === "object" && val !== null){
          return { label: k, text: val.text || val.content || String(val), is_correct: val.is_correct };
        }
        return { label: k, text: String(val) };
      });
    } else if(Array.isArray(items)){
      cleanItems = items.map((it, iIdx) => {
        if(typeof it === "string"){
          const m = it.match(/^([a-d])[\)\.]\s*(.*)/i);
          return m ? { label: m[1].toLowerCase(), text: m[2] } : { label: ["a","b","c","d"][iIdx] || String(iIdx+1), text: it };
        }
        return {
          label: it.label || it.key || ["a","b","c","d"][iIdx] || String(iIdx+1),
          text: it.text || it.statement || it.content || "",
          is_correct: it.is_correct ?? it.correct
        };
      });
    }
    return {
      num: q.num || q.so_cau || (idx + 1),
      level: q.level || q.muc_do || "",
      stem: q.stem || q.question || q.de_bai || q.content || "",
      items: cleanItems
    };
  });

  // Part 3: Short Answer
  const p3Raw = rawObj.part3_short_answer || rawObj.part3 || rawObj.part_3 || rawObj.phan3 || rawObj.phan_3 || rawObj.phan3_tra_loi_ngan || rawObj.partIII || rawObj.phan_III || rawObj.part3_sa || {};
  const q3ListRaw = Array.isArray(p3Raw.questions) ? p3Raw.questions : (Array.isArray(p3Raw.cau_hoi) ? p3Raw.cau_hoi : (Array.isArray(p3Raw) ? p3Raw : (Array.isArray(p3Raw.items) ? p3Raw.items : [])));
  const q3List = q3ListRaw.map((q, idx) => {
    if(typeof q === "string") return { num: idx + 1, question: q };
    return {
      num: q.num || q.so_cau || (idx + 1),
      level: q.level || q.muc_do || "",
      question: q.question || q.de_bai || q.content || ""
    };
  });

  // Part 4: Essay (if any)
  const p4Raw = rawObj.part4_essay || rawObj.part4 || rawObj.part_4 || rawObj.phan4 || rawObj.phan_4 || rawObj.phan4_tu_luan || rawObj.partIV || rawObj.phan_IV || {};
  const q4ListRaw = Array.isArray(p4Raw.questions) ? p4Raw.questions : (Array.isArray(p4Raw.cau_hoi) ? p4Raw.cau_hoi : (Array.isArray(p4Raw) ? p4Raw : (Array.isArray(p4Raw.items) ? p4Raw.items : [])));
  const q4List = q4ListRaw.map((q, idx) => {
    if(typeof q === "string") return { num: idx + 1, question: q };
    return {
      num: q.num || q.so_cau || (idx + 1),
      question: q.question || q.de_bai || q.content || ""
    };
  });

  // Solutions
  const solsRaw = rawObj.solutions || rawObj.solution || rawObj.dap_an || rawObj.huong_dan_cham || rawObj.answers || {};
  const p1Sols = Array.isArray(solsRaw.part1 || solsRaw.phan1 || solsRaw.part1_mcq) ? (solsRaw.part1 || solsRaw.phan1 || solsRaw.part1_mcq) : [];
  const p2Sols = Array.isArray(solsRaw.part2 || solsRaw.phan2 || solsRaw.part2_true_false) ? (solsRaw.part2 || solsRaw.phan2 || solsRaw.part2_true_false) : [];
  const p3Sols = Array.isArray(solsRaw.part3 || solsRaw.phan3 || solsRaw.part3_short_answer) ? (solsRaw.part3 || solsRaw.phan3 || solsRaw.part3_short_answer) : [];
  const p4Sols = Array.isArray(solsRaw.part4 || solsRaw.phan4 || solsRaw.part4_essay) ? (solsRaw.part4 || solsRaw.phan4 || solsRaw.part4_essay) : [];

  return {
    title,
    subject: mon,
    grade: lop,
    exam_header: header,
    part1_mcq: {
      title: p1Raw.title || "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN",
      instruction: p1Raw.instruction || `Thí sinh trả lời từ câu 1 đến câu ${q1List.length || 12}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
      points: p1Raw.points || "3.0 điểm",
      questions: q1List
    },
    part2_true_false: {
      title: p2Raw.title || "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI",
      instruction: p2Raw.instruction || `Thí sinh trả lời từ câu 1 đến câu ${q2List.length || 4}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`,
      points: p2Raw.points || "4.0 điểm",
      questions: q2List
    },
    part3_short_answer: {
      title: p3Raw.title || "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN",
      instruction: p3Raw.instruction || `Thí sinh trả lời từ câu 1 đến câu ${q3List.length || 6}. Điền kết quả/đáp số vào ô quy định.`,
      points: p3Raw.points || "3.0 điểm",
      questions: q3List
    },
    part4_essay: {
      title: p4Raw.title || "PHẦN IV. CÂU HỎI TỰ LUẬN",
      instruction: p4Raw.instruction || "Thí sinh trình bày chi tiết các bước làm bài vào giấy làm bài.",
      points: p4Raw.points || "",
      questions: q4List
    },
    solutions: {
      title: solsRaw.title || "ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM",
      part1: p1Sols,
      part2: p2Sols,
      part3: p3Sols,
      part4: p4Sols
    }
  };
}

// 2. BỘ TRÍCH XUẤT ĐỀ THI TỰ ĐỘNG TỪ VĂN BẢN / MARKDOWN (SMART EXAM TEXT PARSER)
function parseExamTextToStructure(rawText, formValues){
  if(!rawText || typeof rawText !== "string") return null;
  const str = rawText.replace(/\r\n/g, "\n");
  const v = formValues || {};

  let p1Text = "", p2Text = "", p3Text = "", p4Text = "";
  const sectionSplit = str.split(/(?:^|\n)(?=(?:#{1,3}\s*|\*\*\s*)?(?:PHẦN\s*(?:I|II|III|IV|1|2|3|4)|ĐÁP\s*ÁN|HƯỚNG\s*DẪN\s*CHẤM))/i);
  
  if(sectionSplit.length > 1){
    sectionSplit.forEach(sec => {
      const trimmed = sec.trim();
      const cleanHeader = trimmed.replace(/^[#*\s]+/, "").toUpperCase();
      if(/^PHẦN\s*(?:IV|4)\b/i.test(cleanHeader)){
        p4Text = trimmed;
      } else if(/^PHẦN\s*(?:III|3)\b/i.test(cleanHeader)){
        p3Text = trimmed;
      } else if(/^PHẦN\s*(?:II|2)\b/i.test(cleanHeader)){
        p2Text = trimmed;
      } else if(/^PHẦN\s*(?:I|1)\b/i.test(cleanHeader)){
        p1Text = trimmed;
      }
    });
  } else {
    p1Text = str;
  }

  function parseQuestions(sectionText, type){
    const list = [];
    if(!sectionText) return list;
    
    const qMatches = sectionText.split(/(?:^|\n)(?:###?\s*|\*\*\s*)?Câu\s*(\d+)[\.\s:\-]/i);
    for(let i = 1; i < qMatches.length; i += 2){
      const num = parseInt(qMatches[i], 10) || (list.length + 1);
      const content = (qMatches[i+1] || "").trim();
      
      if(type === "mcq"){
        const chunks = content.split(/(?:^|\n|\s{2,})(?=[A-D][\.\)])/);
        let qStem = chunks[0].trim();
        const opts = [];
        for(let c = 1; c < chunks.length; c++){
          const optStr = chunks[c].trim();
          if(optStr) opts.push(optStr);
        }
        if(opts.length < 2){
          const inlineMatches = [...content.matchAll(/(?:^|\s+)([A-D])[\.\)]\s*([^\n\rA-D]+)/g)];
          if(inlineMatches.length >= 2){
            opts.length = 0;
            const firstIdx = content.search(/(?:^|\s+)[A-D][\.\)]/);
            if(firstIdx !== -1) qStem = content.substring(0, firstIdx).trim();
            inlineMatches.forEach(im => opts.push(`${im[1].toUpperCase()}. ${im[2].trim()}`));
          }
        }
        list.push({ num, question: qStem, options: opts });
      } else if(type === "tf"){
        const chunks = content.split(/(?:^|\n|\s{2,})(?=[a-d][\)\.])/i);
        let stem = chunks[0].trim();
        const items = [];
        for(let c = 1; c < chunks.length; c++){
          const chunkStr = chunks[c].trim();
          const m = chunkStr.match(/^([a-d])[\)\.]\s*([\s\S]*)/i);
          if(m){
            items.push({ label: m[1].toLowerCase(), text: m[2].trim() });
          }
        }
        list.push({ num, stem, items });
      } else {
        list.push({ num, question: content });
      }
    }
    return list;
  }

  let q1List = parseQuestions(p1Text, "mcq");
  let q2List = parseQuestions(p2Text, "tf");
  let q3List = parseQuestions(p3Text, "short");
  let q4List = parseQuestions(p4Text, "essay");

  if(!p2Text && !p3Text && q1List.length > 0){
    const newQ1 = [], newQ2 = [], newQ3 = [];
    q1List.forEach(q => {
      if(q.options && q.options.length >= 2){
        newQ1.push(q);
      } else {
        const subMatches = [...q.question.matchAll(/(?:^|\n|\s{2,})([a-d])[\)\.]\s*([\s\S]*?)(?=(?:^|\n|\s{2,})[a-d][\)\.]|$)/gi)];
        if(subMatches.length >= 2){
          const firstIdx = q.question.search(/(?:^|\n|\s{2,})[a-d][\)\.]/i);
          const stem = firstIdx !== -1 ? q.question.substring(0, firstIdx).trim() : q.question;
          const items = subMatches.map(sm => ({ label: sm[1].toLowerCase(), text: sm[2].trim() }));
          newQ2.push({ num: newQ2.length + 1, stem, items });
        } else {
          newQ3.push({ num: newQ3.length + 1, question: q.question });
        }
      }
    });
    if(newQ2.length > 0 || newQ3.length > 0){
      q1List = newQ1;
      q2List = newQ2;
      q3List = newQ3;
    }
  }

  const solRegex = /(?:^|\n)(?:#{1,3}\s*|\*\*\s*)?(?:ĐÁP\s*ÁN|HƯỚNG\s*DẪN\s*CHẤM)[\s\S]*$/i;
  const solMatch = str.match(solRegex);
  const p1Sols = [];
  if(solMatch){
    const sText = solMatch[0];
    const p1SolMatches = sText.match(/(?:Câu\s*)?(\d+)[\.\s:\-]+([A-D])\b/gi);
    if(p1SolMatches){
      p1SolMatches.forEach(m => p1Sols.push(m.trim()));
    }
  }

  if(q1List.length === 0 && q2List.length === 0 && q3List.length === 0 && q4List.length === 0){
    return null;
  }

  return {
    title: v.tieude || "BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I",
    subject: v.mon || "Toán",
    grade: v.lop || "Lớp 12",
    exam_header: {
      ministry: v.ten_so || "SỞ GIÁO DỤC VÀ ĐÀO TẠO",
      school: v.ten_truong || "TRƯỜNG THPT CHUYÊN ...........................",
      department: v.to_bomon || "",
      code: v.ma_de ? (String(v.ma_de).includes("MÃ") ? v.ma_de : "MÃ ĐỀ THI: " + v.ma_de) : "MÃ ĐỀ THI: 101",
      academic_year: v.nam_hoc || "2025 - 2026",
      time: v.thoi_gian ? (v.thoi_gian.includes("Thời gian") ? v.thoi_gian : "Thời gian làm bài: " + v.thoi_gian + " (không kể thời gian phát đề)") : "Thời gian làm bài: 90 phút (không kể thời gian phát đề)"
    },
    part1_mcq: {
      title: "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN",
      instruction: `Thí sinh trả lời từ câu 1 đến câu ${q1List.length || 12}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
      points: "3.0 điểm",
      questions: q1List
    },
    part2_true_false: {
      title: "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI",
      instruction: `Thí sinh trả lời từ câu 1 đến câu ${q2List.length || 4}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`,
      points: "4.0 điểm",
      questions: q2List
    },
    part3_short_answer: {
      title: "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN",
      instruction: `Thí sinh trả lời từ câu 1 đến câu ${q3List.length || 6}. Điền kết quả/đáp số vào ô quy định.`,
      points: "3.0 điểm",
      questions: q3List
    },
    part4_essay: {
      title: "PHẦN IV. CÂU HỎI TỰ LUẬN",
      instruction: "Thí sinh trình bày chi tiết các bước làm bài vào giấy làm bài.",
      points: "",
      questions: q4List
    },
    solutions: {
      title: "ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM",
      part1: p1Sols,
      part2: [],
      part3: [],
      part4: []
    }
  };
}

// 3. HÀM BIÊN DỊCH GIAO DIỆN ĐỀ THI CHUẨN CÔNG VĂN 7991
function compileExamToHtml(data, formValues, viewMode = "exam"){
  if(typeof viewMode === "boolean"){
    viewMode = viewMode ? "solutions" : "exam";
  }
  if(!viewMode) viewMode = "exam";

  let examData = null;
  let rawText = "";

  if(typeof data === "object" && data !== null){
    examData = normalizeExamData(data, formValues);
  } else if(typeof data === "string"){
    rawText = data.trim();
    // 1. Thử parse JSON có chống lỗi LaTeX
    const parsedObj = safeParseJsonWithLatex(data);
    if(parsedObj){
      examData = normalizeExamData(parsedObj, formValues);
    }
    // 2. Nếu parse JSON thất bại hoặc 0 câu hỏi, thử phân tích dạng văn bản
    const qCount1 = (examData && examData.part1_mcq && examData.part1_mcq.questions) ? examData.part1_mcq.questions.length : 0;
    const qCount2 = (examData && examData.part2_true_false && examData.part2_true_false.questions) ? examData.part2_true_false.questions.length : 0;
    const qCount3 = (examData && examData.part3_short_answer && examData.part3_short_answer.questions) ? examData.part3_short_answer.questions.length : 0;
    if(qCount1 + qCount2 + qCount3 === 0){
      const textParsed = parseExamTextToStructure(data, formValues);
      if(textParsed){
        examData = textParsed;
      }
    }
  }

  if(!examData){
    examData = normalizeExamData({}, formValues);
    examData._rawText = rawText;
  }

  const title = examData.title || (formValues && formValues.tieude) || "BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I";
  const mon = examData.subject || (formValues && formValues.mon) || "Toán";
  const lop = examData.grade || (formValues && formValues.lop) || "Lớp 12";
  const header = examData.exam_header || {};
  const tenSo = header.ministry || (formValues && formValues.ten_so) || "SỞ GIÁO DỤC VÀ ĐÀO TẠO";
  const tenTruong = header.school || (formValues && formValues.ten_truong) || "TRƯỜNG THPT CHUYÊN ...........................";
  const toBomon = header.department || (formValues && formValues.to_bomon) || "";
  const maDeRaw = header.code || (formValues && formValues.ma_de) || "101";
  const maDe = String(maDeRaw).toUpperCase().includes("MÃ") ? maDeRaw : ("MÃ ĐỀ THI: " + maDeRaw);
  const namHoc = header.academic_year || (formValues && formValues.nam_hoc) || "2025 - 2026";
  const thoiGian = header.time || (formValues && formValues.thoi_gian ? (formValues.thoi_gian.includes("Thời gian") ? formValues.thoi_gian : "Thời gian làm bài: " + formValues.thoi_gian + " (không kể thời gian phát đề)") : "Thời gian làm bài: 90 phút (không kể thời gian phát đề)");

  const p1 = examData.part1_mcq || {};
  const p2 = examData.part2_true_false || {};
  const p3 = examData.part3_short_answer || {};
  const p4 = examData.part4_essay || {};
  const sols = examData.solutions || {};

  const q1List = Array.isArray(p1.questions) ? p1.questions : [];
  const q2List = Array.isArray(p2.questions) ? p2.questions : [];
  const q3List = Array.isArray(p3.questions) ? p3.questions : [];
  const q4List = Array.isArray(p4.questions) ? p4.questions : [];
  const totalQuestions = q1List.length + q2List.length + q3List.length + q4List.length;

  // Part 1 Questions
  let p1Html = "";
  if(q1List.length > 0){
    p1Html = q1List.map((q, idx) => {
      const qNum = q.num || (idx + 1);
      const lvl = q.level ? `<span style="font-size:12px;color:#475569;font-weight:600;">[${escapeHtml(q.level)}]</span> ` : "";
      const opts = Array.isArray(q.options) ? q.options : [];
      return `
        <div class="exam-question">
          <div><strong>Câu ${qNum}:</strong> ${lvl}${escapeHtml(q.question || "")}</div>
          <div class="exam-mcq-grid">
            ${opts.map((opt, oIdx) => {
              const optStr = String(opt).trim();
              const prefix = ["A", "B", "C", "D"][oIdx];
              const displayOpt = /^[A-D][\.\)]/i.test(optStr) ? optStr : (prefix ? `${prefix}. ${optStr}` : optStr);
              return `<div class="exam-mcq-opt">${escapeHtml(displayOpt)}</div>`;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  } else {
    p1Html = `<div style="font-style:italic;color:#64748B;margin-bottom:12px;padding:8px 12px;background:#f8fafc;border-radius:4px;">(Không có câu hỏi trắc nghiệm nhiều phương án lựa chọn ở phần này)</div>`;
  }

  // Part 2 Questions
  let p2Html = "";
  if(q2List.length > 0){
    p2Html = q2List.map((q, idx) => {
      const qNum = q.num || (idx + 1);
      const lvl = q.level ? `<span style="font-size:12px;color:#475569;font-weight:600;">[${escapeHtml(q.level)}]</span> ` : "";
      const items = Array.isArray(q.items) ? q.items : [];
      return `
        <div class="exam-question">
          <div><strong>Câu ${qNum}:</strong> ${lvl}${escapeHtml(q.stem || q.question || "")}</div>
          <div style="margin: 6px 0 0 12px;">
            ${items.map((it, iIdx) => {
              const label = it.label || ["a","b","c","d"][iIdx] || String(iIdx+1);
              return `
                <div class="exam-tf-box">
                  <div><strong>${escapeHtml(String(label))})</strong> ${escapeHtml(it.text || String(it))}</div>
                  <div class="exam-tf-tags">
                    <span class="exam-tf-tag">Đ</span>
                    <span class="exam-tf-tag">S</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");
  } else {
    p2Html = `<div style="font-style:italic;color:#64748B;margin-bottom:12px;padding:8px 12px;background:#f8fafc;border-radius:4px;">(Không có câu hỏi Đúng/Sai ở phần này)</div>`;
  }

  // Part 3 Questions
  let p3Html = "";
  if(q3List.length > 0){
    p3Html = q3List.map((q, idx) => {
      const qNum = q.num || (idx + 1);
      const lvl = q.level ? `<span style="font-size:12px;color:#475569;font-weight:600;">[${escapeHtml(q.level)}]</span> ` : "";
      return `
        <div class="exam-question">
          <div><strong>Câu ${qNum}:</strong> ${lvl}${escapeHtml(q.question || "")}</div>
          <div class="exam-short-ans-box">
            <span style="font-weight:700;color:#0F172A;">Đáp số:</span>
            <span style="display:inline-block;min-width:200px;border-bottom:1.5px dotted #0F172A;">&nbsp;</span>
          </div>
        </div>
      `;
    }).join("");
  } else {
    p3Html = `<div style="font-style:italic;color:#64748B;margin-bottom:12px;padding:8px 12px;background:#f8fafc;border-radius:4px;">(Không có câu hỏi trả lời ngắn ở phần này)</div>`;
  }

  // Part 4 Essay (if any)
  let p4Html = "";
  if(q4List.length > 0){
    p4Html = `
      <div class="exam-part-header">${escapeHtml(p4.title || "PHẦN IV. CÂU HỎI TỰ LUẬN")} ${p4.points ? `(${escapeHtml(p4.points)})` : ''}</div>
      <div style="font-style:italic;font-size:13px;color:#475569;margin-bottom:12px;">${escapeHtml(p4.instruction || "Thí sinh trình bày chi tiết các bước làm bài vào giấy làm bài.")}</div>
      ${q4List.map((q, idx) => `
        <div class="exam-question">
          <div><strong>Câu ${q.num || (idx+1)}:</strong> ${escapeHtml(q.question || "")}</div>
          <div style="margin: 8px 0 14px; min-height: 48px; border: 1px dashed #cbd5e1; border-radius: 4px; padding: 8px; color: #94a3b8; font-style: italic;">
            [Khung bài làm tự luận của thí sinh]
          </div>
        </div>
      `).join("")}
    `;
  }

  // Solutions Part 1 Table
  let p1TableHtml = "";
  if(Array.isArray(sols.part1) && sols.part1.length > 0){
    const items = sols.part1.map((item, idx) => {
      if(typeof item === "object" && item !== null){
        return { num: item.num || (idx + 1), key: item.key || item.answer || item.dap_an || "" };
      }
      const str = String(item).trim();
      const m = str.match(/(?:Câu\s*)?(\d+)[\.\s:\-]+([A-D])/i);
      if(m) return { num: m[1], key: m[2].toUpperCase() };
      return { num: idx + 1, key: str };
    });
    p1TableHtml = `
      <table class="exam-ans-table">
        <thead>
          <tr><th style="width:70px;background:#EEF2FF;">Câu</th>${items.map(it => `<th>${it.num}</th>`).join("")}</tr>
        </thead>
        <tbody>
          <tr><td style="font-weight:700;background:#F8FAFC;">Chọn</td>${items.map(it => `<td style="font-weight:700;color:#2563EB;font-size:15px;">${escapeHtml(String(it.key))}</td>`).join("")}</tr>
        </tbody>
      </table>
    `;
  } else {
    p1TableHtml = `<div style="background:#fff;padding:8px 12px;border:1px solid #CBD5E1;border-radius:6px;margin:6px 0;font-style:italic;color:#64748B;">Chưa có dữ liệu bảng đáp án Phần I</div>`;
  }

  // Solutions Part 2 Table
  let p2TableHtml = "";
  if(Array.isArray(sols.part2) && sols.part2.length > 0){
    p2TableHtml = `
      <table class="exam-ans-table">
        <thead>
          <tr>
            <th style="width:80px;background:#EEF2FF;">Câu</th>
            <th style="width:16%;">Lệnh hỏi a</th>
            <th style="width:16%;">Lệnh hỏi b</th>
            <th style="width:16%;">Lệnh hỏi c</th>
            <th style="width:16%;">Lệnh hỏi d</th>
            <th>Tóm tắt nhận định</th>
          </tr>
        </thead>
        <tbody>
          ${sols.part2.map((s, idx) => {
            const qNum = s.num || (idx + 1);
            let a = "-", b = "-", c = "-", d = "-";
            if(s.answers && typeof s.answers === "object"){
              a = s.answers.a || s.answers["1"] || "-";
              b = s.answers.b || s.answers["2"] || "-";
              c = s.answers.c || s.answers["3"] || "-";
              d = s.answers.d || s.answers["4"] || "-";
            } else if(typeof s.answers === "string"){
              const str = s.answers;
              const ma = str.match(/a\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
              const mb = str.match(/b\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
              const mc = str.match(/c\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
              const md = str.match(/d\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
              if(ma) a = ma[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
              if(mb) b = mb[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
              if(mc) c = mc[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
              if(md) d = md[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
            }
            return `
              <tr>
                <td style="font-weight:700;">Câu ${qNum}</td>
                <td style="font-weight:700;font-size:15px;color:${a==='Đ'?'#16A34A':'#DC2626'};">${escapeHtml(a)}</td>
                <td style="font-weight:700;font-size:15px;color:${b==='Đ'?'#16A34A':'#DC2626'};">${escapeHtml(b)}</td>
                <td style="font-weight:700;font-size:15px;color:${c==='Đ'?'#16A34A':'#DC2626'};">${escapeHtml(c)}</td>
                <td style="font-weight:700;font-size:15px;color:${d==='Đ'?'#16A34A':'#DC2626'};">${escapeHtml(d)}</td>
                <td style="text-align:left;font-size:12.5px;">${escapeHtml(s.summary || s.answers || "")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      <div style="margin: 8px 0 12px; padding: 8px 14px; background:#EFF6FF; border-left:4px solid #2563EB; font-size:13px; color:#1E40AF; border-radius: 4px;">
        <strong>⚖️ Barem điểm chuẩn CV 7991:</strong> Thí sinh chọn đúng 01 ý được <strong>0,10 điểm</strong>; đúng 02 ý được <strong>0,25 điểm</strong>; đúng 03 ý được <strong>0,50 điểm</strong>; đúng cả 04 ý được <strong>1,00 điểm</strong>.
      </div>
      <div style="margin-top:10px;">
        <strong style="color:#0F172A;">Lời giải chi tiết từng ý Phần II:</strong>
        ${sols.part2.map((s, idx) => `
          <div style="margin: 6px 0 10px 8px; font-size:13.5px; line-height:1.55; background:#fff; padding:6px 12px; border-radius:4px; border:1px solid #E2E8F0;">
            <strong style="color:#1E3A8A;">Câu ${s.num || (idx+1)}:</strong> ${escapeHtml(s.explanation || "Theo dữ kiện đề bài.")}
          </div>
        `).join("")}
      </div>
    `;
  }

  // Solutions Part 3 Table
  let p3TableHtml = "";
  if(Array.isArray(sols.part3) && sols.part3.length > 0){
    p3TableHtml = `
      <table class="exam-ans-table">
        <thead>
          <tr>
            <th style="width:80px;background:#EEF2FF;">Câu</th>
            <th style="width:25%;">Đáp số chuẩn</th>
            <th>Tóm tắt các bước giải / Ghi chú</th>
            <th style="width:90px;">Điểm</th>
          </tr>
        </thead>
        <tbody>
          ${sols.part3.map((s, idx) => {
            const qNum = s.num || (idx + 1);
            return `
              <tr>
                <td style="font-weight:700;">Câu ${qNum}</td>
                <td style="font-weight:700;color:#2563EB;font-size:14px;">${escapeHtml(String(s.answer || s.key || ""))}</td>
                <td style="text-align:left;font-size:13px;">${escapeHtml(s.explanation || "Theo phép tính chuẩn.")}</td>
                <td style="font-weight:600;">0,5 đ</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  // Solutions Part 4 Essay
  let p4SolHtml = "";
  if(Array.isArray(sols.part4) && sols.part4.length > 0){
    p4SolHtml = `
      <div style="margin-bottom:20px;">
        <div style="font-weight:700;color:#1e3a8a;font-size:14.5px;margin-bottom:6px;">PHẦN IV. HƯỚNG DẪN CHẤM VÀ THANG ĐIỂM TỰ LUẬN</div>
        ${sols.part4.map((s, idx) => `
          <div style="margin-bottom:10px;padding:8px 12px;background:#fff;border:1px solid #E2E8F0;border-radius:4px;">
            <div><strong>Câu ${s.num || (idx+1)}:</strong> ${escapeHtml(s.solution || "")}</div>
            <div style="font-size:12.5px;color:#15803D;font-weight:600;margin-top:4px;">Thang điểm: ${escapeHtml(s.points || "1.0 điểm")}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // Khung hiển thị dự phòng nếu không trích xuất được câu hỏi nào từ chuỗi văn bản
  let fallbackNoticeHtml = "";
  if(totalQuestions === 0 && (examData._rawText || rawText)){
    fallbackNoticeHtml = `
      <div style="margin:16px 0;padding:14px 18px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:6px;color:#92400E;font-size:13.5px;line-height:1.6;">
        <strong>💡 Đã tải nội dung thành công:</strong> AI hoặc tệp nguồn đã cung cấp nội dung đề thi dạng văn bản. Bạn có thể xem toàn bộ nội dung chi tiết bên dưới hoặc bấm tab <strong>"📄 Xem văn bản"</strong> trên thanh điều hướng.
      </div>
      <div style="white-space:pre-wrap;font-family:'Times New Roman',serif;font-size:13.5pt;line-height:1.7;padding:18px;background:#fff;border:1px solid #CBD5E1;border-radius:6px;color:#0F172A;margin-bottom:20px;">
        ${escapeHtml(examData._rawText || rawText)}
      </div>
    `;
  }

  // Exam Paper Block
  const examPaperHtml = `
    <div class="exam-container" id="printableUniversal">
      <div class="exam-header-grid">
        <div class="exam-header-left">
          <div class="exam-org-title">${escapeHtml(tenSo)}</div>
          <div class="exam-school-title">${escapeHtml(tenTruong)}</div>
          ${toBomon ? `<div class="exam-dept-title">${escapeHtml(toBomon)}</div>` : ''}
          <div class="exam-code-box">${escapeHtml(maDe)}</div>
        </div>
        <div class="exam-header-right">
          <div class="exam-name-title">${escapeHtml(title)}</div>
          <div class="exam-sub-info">NĂM HỌC: ${escapeHtml(namHoc)}</div>
          <div class="exam-sub-info"><strong>MÔN: ${escapeHtml(mon.toUpperCase())} - ${escapeHtml(lop.toUpperCase())}</strong></div>
          <div class="exam-time-info"><em>${escapeHtml(thoiGian)}</em></div>
        </div>
      </div>
      <div class="exam-divider-line"></div>
      <div class="exam-student-info">
        <div>Họ và tên thí sinh: ................................................................................</div>
        <div>Số báo danh: ....................</div>
        <div>Phòng thi: ...........</div>
      </div>

      ${fallbackNoticeHtml ? fallbackNoticeHtml : `
        <!-- PART 1 -->
        <div class="exam-part-header">${escapeHtml(p1.title || "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN")} (${escapeHtml(p1.points || "3.0 điểm")})</div>
        <div style="font-style:italic;font-size:13px;color:#475569;margin-bottom:12px;">${escapeHtml(p1.instruction || "Thí sinh trả lời từ câu 1 đến câu " + (q1List.length || 12) + ". Mỗi câu hỏi thí sinh chỉ chọn một phương án.")}</div>
        ${p1Html}

        <!-- PART 2 -->
        <div class="exam-part-header">${escapeHtml(p2.title || "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI")} (${escapeHtml(p2.points || "4.0 điểm")})</div>
        <div style="font-style:italic;font-size:13px;color:#475569;margin-bottom:4px;">${escapeHtml(p2.instruction || "Thí sinh trả lời từ câu 1 đến câu " + (q2List.length || 4) + ". Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.")}</div>
        <div style="font-style:italic;font-size:12px;color:#1E40AF;margin-bottom:12px;">(Quy tắc tính điểm chuẩn CV 7991: Đúng 1 ý: 0,1đ · Đúng 2 ý: 0,25đ · Đúng 3 ý: 0,5đ · Đúng 4 ý: 1,0đ)</div>
        ${p2Html}

        <!-- PART 3 -->
        <div class="exam-part-header">${escapeHtml(p3.title || "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN")} (${escapeHtml(p3.points || "3.0 điểm")})</div>
        <div style="font-style:italic;font-size:13px;color:#475569;margin-bottom:12px;">${escapeHtml(p3.instruction || "Thí sinh trả lời từ câu 1 đến câu " + (q3List.length || 6) + ". Điền kết quả/đáp số vào ô quy định.")}</div>
        ${p3Html}

        ${p4Html}
      `}

      <div style="text-align:center;font-weight:700;margin:28px 0 6px;font-size:14px;">--- HẾT ---</div>
      <div style="text-align:center;font-style:italic;font-size:12.5px;color:#64748B;">(Thí sinh không được sử dụng tài liệu · Cán bộ coi thi không giải thích gì thêm)</div>
    </div>
  `;

  // Solutions Block
  const solutionsBlockHtml = `
    <div class="exam-solution-container ${viewMode === 'all' ? 'exam-page-break' : ''}" id="printableSolutions">
      <div class="exam-solution-header">
        <div style="font-weight:700;font-size:13.5px;text-transform:uppercase;">${escapeHtml(tenSo)} - ${escapeHtml(tenTruong)}</div>
        <div style="font-size:16.5px;font-weight:800;color:#1e3a8a;margin:6px 0 2px;text-transform:uppercase;">
          ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BAREM ĐIỂM
        </div>
        <div style="font-weight:700;font-size:14px;margin-bottom:2px;">${escapeHtml(title)} - MÔN: ${escapeHtml(mon.toUpperCase())} ${escapeHtml(lop.toUpperCase())}</div>
        <div style="font-size:13px;font-style:italic;color:#475569;">Áp dụng chuẩn đánh giá theo Công văn số 7991/BGDĐT-GDTrH · ${escapeHtml(maDe)} · Năm học: ${escapeHtml(namHoc)}</div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-weight:700;color:#1e3a8a;font-size:14.5px;margin-bottom:6px;">PHẦN I. BẢNG ĐÁP ÁN TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN</div>
        ${p1TableHtml}
        <div style="font-size:12.5px;font-style:italic;color:#475569;">Mỗi câu trả lời đúng thí sinh được <strong>0,25 điểm</strong>.</div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-weight:700;color:#1e3a8a;font-size:14.5px;margin-bottom:6px;">PHẦN II. BẢNG ĐÁP ÁN ĐÚNG/SAI & HƯỚNG DẪN CHẤM</div>
        ${p2TableHtml}
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-weight:700;color:#1e3a8a;font-size:14.5px;margin-bottom:6px;">PHẦN III. BẢNG ĐÁP SỐ TRẢ LỜI NGẮN & TÓM TẮT LỜI GIẢI</div>
        ${p3TableHtml}
      </div>

      ${p4SolHtml}
    </div>
  `;

  // Body content depending on viewMode
  let bodyContent = "";
  if(viewMode === "solutions"){
    bodyContent = solutionsBlockHtml;
  } else if(viewMode === "all"){
    bodyContent = examPaperHtml + solutionsBlockHtml;
  } else {
    bodyContent = examPaperHtml;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>📑 Đề Kiểm Tra Chuẩn CV 7991/BGDĐT-GDTrH</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">${escapeHtml(maDe)}</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <!-- Chuyển đổi chế độ xem -->
        <div style="display:inline-flex;background:rgba(0,0,0,0.06);padding:2px;border-radius:8px;gap:2px;">
          <button class="btn btn-sm ${viewMode==='exam'?'btn-primary':'btn-ghost'}" id="examViewExamBtn" style="font-size:12px;padding:4px 10px;">
            📄 Bản Đề Thi
          </button>
          <button class="btn btn-sm ${viewMode==='solutions'?'btn-primary':'btn-ghost'}" id="examViewSolBtn" style="font-size:12px;padding:4px 10px;">
            🔑 Đáp Án & HD Chấm
          </button>
          <button class="btn btn-sm ${viewMode==='all'?'btn-primary':'btn-ghost'}" id="examViewAllBtn" style="font-size:12px;padding:4px 10px;">
            📑 Trọn Bộ (Đề + Đáp Án)
          </button>
        </div>

        <!-- In ấn & Tải về -->
        <button class="btn btn-primary btn-sm" id="examPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In A4 chuẩn / PDF
        </button>
        <button class="btn btn-ghost btn-sm" id="examDocExamBtn" style="font-size:12px;color:#2563EB;border-color:rgba(37,99,235,0.4);">
          📄 Tải Word Đề Thi
        </button>
        <button class="btn btn-ghost btn-sm" id="examDocSolBtn" style="font-size:12px;color:#7C3AED;border-color:rgba(124,58,237,0.4);">
          🔑 Tải Word Đáp Án
        </button>
        <button class="btn btn-ghost btn-sm" id="examDocAllBtn" style="font-size:12px;color:#059669;border-color:rgba(5,150,105,0.4);">
          📦 Tải Word Trọn Bộ
        </button>
        <button class="btn btn-ghost btn-sm" id="examHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải HTML
        </button>
      </div>
    </div>
    ${bodyContent}
  `;
}

/* --- XUẤT FILE WORD CHUẨN MICROSOFT WORD CHO ĐỀ THI & HƯỚNG DẪN CHẤM --- */
function exportExamToWord(mode, data, formValues){
  let examData = null;
  let rawText = "";

  if(typeof data === "object" && data !== null){
    examData = normalizeExamData(data, formValues);
  } else if(typeof data === "string"){
    rawText = data.trim();
    const parsedObj = safeParseJsonWithLatex(data);
    if(parsedObj){
      examData = normalizeExamData(parsedObj, formValues);
    }
    const qCount1 = (examData && examData.part1_mcq && examData.part1_mcq.questions) ? examData.part1_mcq.questions.length : 0;
    const qCount2 = (examData && examData.part2_true_false && examData.part2_true_false.questions) ? examData.part2_true_false.questions.length : 0;
    const qCount3 = (examData && examData.part3_short_answer && examData.part3_short_answer.questions) ? examData.part3_short_answer.questions.length : 0;
    if(qCount1 + qCount2 + qCount3 === 0){
      const textParsed = parseExamTextToStructure(data, formValues);
      if(textParsed) examData = textParsed;
    }
  }

  if(!examData){
    examData = normalizeExamData({}, formValues);
    examData._rawText = rawText;
  }

  const title = examData.title || (formValues && formValues.tieude) || "BÀI KIỂM TRA ĐỊNH KỲ HỌC KỲ I";
  const mon = examData.subject || (formValues && formValues.mon) || "Toán";
  const lop = examData.grade || (formValues && formValues.lop) || "Lớp 12";
  const header = examData.exam_header || {};
  const tenSo = header.ministry || (formValues && formValues.ten_so) || "SỞ GIÁO DỤC VÀ ĐÀO TẠO";
  const tenTruong = header.school || (formValues && formValues.ten_truong) || "TRƯỜNG THPT CHUYÊN ...........................";
  const toBomon = header.department || (formValues && formValues.to_bomon) || "";
  const maDeRaw = header.code || (formValues && formValues.ma_de) || "101";
  const maDe = String(maDeRaw).toUpperCase().includes("MÃ") ? maDeRaw : ("MÃ ĐỀ THI: " + maDeRaw);
  const namHoc = header.academic_year || (formValues && formValues.nam_hoc) || "2025 - 2026";
  const thoiGian = header.time || (formValues && formValues.thoi_gian ? (formValues.thoi_gian.includes("Thời gian") ? formValues.thoi_gian : "Thời gian làm bài: " + formValues.thoi_gian + " (không kể thời gian phát đề)") : "Thời gian làm bài: 90 phút (không kể thời gian phát đề)");

  const p1 = examData.part1_mcq || {};
  const p2 = examData.part2_true_false || {};
  const p3 = examData.part3_short_answer || {};
  const p4 = examData.part4_essay || {};
  const sols = examData.solutions || {};

  let docExamBody = "";
  if(mode === "exam" || mode === "all"){
    const q1List = Array.isArray(p1.questions) ? p1.questions : [];
    const q2List = Array.isArray(p2.questions) ? p2.questions : [];
    const q3List = Array.isArray(p3.questions) ? p3.questions : [];
    const q4List = Array.isArray(p4.questions) ? p4.questions : [];
    const totalQ = q1List.length + q2List.length + q3List.length + q4List.length;

    docExamBody = `
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;border:none;">
        <tr>
          <td style="width:48%;vertical-align:top;border:none;padding:0;">
            <b style="font-size:11pt;text-transform:uppercase;">${tenSo}</b><br>
            <b style="font-size:10.5pt;text-transform:uppercase;">${tenTruong}</b><br>
            ${toBomon ? `<span style="font-size:10pt;text-transform:uppercase;">${toBomon}</span><br>` : ''}
            <div style="border:1.5pt solid black;display:inline-block;padding:2px 10px;margin-top:6px;font-weight:bold;font-size:10.5pt;">${maDe}</div>
          </td>
          <td style="width:52%;vertical-align:top;text-align:center;border:none;padding:0;">
            <b style="font-size:12.5pt;text-transform:uppercase;">${title}</b><br>
            <span style="font-size:10.5pt;">NĂM HỌC: ${namHoc}</span><br>
            <b style="font-size:11pt;">MÔN: ${mon.toUpperCase()} - ${lop.toUpperCase()}</b><br>
            <i style="font-size:10pt;">${thoiGian}</i>
          </td>
        </tr>
      </table>
      <div style="border-top:1.5pt solid black;margin:8px 0 12px 0;"></div>
      <div style="border:1pt solid black;padding:6px 12px;margin-bottom:16px;font-size:11pt;">
        Họ và tên thí sinh: ............................................................................ Số báo danh: ..................... Phòng thi: ...........
      </div>

      ${totalQ === 0 && (examData._rawText || rawText) ? `
        <div style="font-size:11.5pt;line-height:1.65;white-space:pre-wrap;margin-top:14px;padding:8px;">
          ${escapeHtml(examData._rawText || rawText)}
        </div>
      ` : `
        <p style="font-weight:bold;font-size:11.5pt;margin-top:16px;margin-bottom:4px;">${p1.title || "PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN"} (${p1.points || "3.0 điểm"})</p>
        <p style="font-style:italic;font-size:10.5pt;margin-top:0;margin-bottom:10px;">${p1.instruction || "Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi thí sinh chỉ chọn một phương án."}</p>
        ${q1List.map((q, idx) => `
          <div style="margin-bottom:10px;font-size:11pt;">
            <b>Câu ${q.num || (idx+1)}:</b> ${q.question || ""}<br>
            <table style="width:100%;border:none;margin-top:4px;">
              <tr>
                ${(q.options || []).map(opt => `<td style="border:none;padding:3px 6px;width:25%;">${opt}</td>`).join("")}
              </tr>
            </table>
          </div>
        `).join("")}

        <p style="font-weight:bold;font-size:11.5pt;margin-top:18px;margin-bottom:4px;">${p2.title || "PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI"} (${p2.points || "4.0 điểm"})</p>
        <p style="font-style:italic;font-size:10.5pt;margin-top:0;margin-bottom:4px;">${p2.instruction || "Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai."}</p>
        <p style="font-style:italic;font-size:10pt;color:#1e3a8a;margin-top:0;margin-bottom:10px;">(Quy tắc tính điểm chuẩn CV 7991: Đúng 1 ý: 0,1đ · Đúng 2 ý: 0,25đ · Đúng 3 ý: 0,5đ · Đúng 4 ý: 1,0đ)</p>
        ${q2List.map((q, idx) => `
          <div style="margin-bottom:12px;font-size:11pt;">
            <b>Câu ${q.num || (idx+1)}:</b> ${q.stem || q.question || ""}<br>
            ${(q.items || []).map(it => `
              <div style="margin-left:14px;line-height:1.6;">
                <b>${it.label})</b> ${it.text || ""} <b>[ Đúng &nbsp; | &nbsp; Sai ]</b>
              </div>
            `).join("")}
          </div>
        `).join("")}

        <p style="font-weight:bold;font-size:11.5pt;margin-top:18px;margin-bottom:4px;">${p3.title || "PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN"} (${p3.points || "3.0 điểm"})</p>
        <p style="font-style:italic;font-size:10.5pt;margin-top:0;margin-bottom:10px;">${p3.instruction || "Thí sinh trả lời từ câu 1 đến câu 6. Điền kết quả vào ô quy định."}</p>
        ${q3List.map((q, idx) => `
          <div style="margin-bottom:10px;font-size:11pt;">
            <b>Câu ${q.num || (idx+1)}:</b> ${q.question || ""}<br>
            <div style="margin-top:4px;padding:4px 8px;">
              <b>Đáp số:</b> ............................................................
            </div>
          </div>
        `).join("")}

        ${q4List.length > 0 ? `
          <p style="font-weight:bold;font-size:11.5pt;margin-top:18px;margin-bottom:4px;">${p4.title || "PHẦN IV. CÂU HỎI TỰ LUẬN"} (${p4.points || ""})</p>
          ${q4List.map((q, idx) => `
            <div style="margin-bottom:12px;font-size:11pt;">
              <b>Câu ${q.num || (idx+1)}:</b> ${q.question || ""}
            </div>
          `).join("")}
        ` : ''}
      `}

      <p style="text-align:center;font-weight:bold;margin-top:24px;font-size:11pt;">--- HẾT ---</p>
      <p style="text-align:center;font-style:italic;font-size:10pt;">(Thí sinh không được sử dụng tài liệu · Cán bộ coi thi không giải thích gì thêm)</p>
    `;
  }

  let docSolBody = "";
  if(mode === "solutions" || mode === "all"){
    const p1Items = (Array.isArray(sols.part1) ? sols.part1 : []).map((item, idx) => {
      if(typeof item === "object" && item !== null) return { num: item.num || (idx + 1), key: item.key || item.answer || "" };
      const str = String(item).trim();
      const m = str.match(/(?:Câu\s*)?(\d+)[\.\s:\-]+([A-D])/i);
      if(m) return { num: m[1], key: m[2].toUpperCase() };
      return { num: idx + 1, key: str };
    });

    const p2Items = Array.isArray(sols.part2) ? sols.part2 : [];
    const p3Items = Array.isArray(sols.part3) ? sols.part3 : [];

    docSolBody = `
      ${mode === "all" ? "<br clear=all style='mso-special-character:line-break;page-break-before:always'>" : ""}
      <div style="text-align:center;margin-bottom:16px;">
        <b style="font-size:11pt;text-transform:uppercase;">${tenSo} - ${tenTruong}</b><br>
        <b style="font-size:13pt;color:#1e3a8a;text-transform:uppercase;">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BAREM ĐIỂM</b><br>
        <b style="font-size:11.5pt;">${title} - MÔN: ${mon.toUpperCase()} ${lop.toUpperCase()}</b><br>
        <i style="font-size:10pt;">Áp dụng chuẩn đánh giá theo Công văn 7991/BGDĐT-GDTrH · ${maDe} · Năm học: ${namHoc}</i>
      </div>

      <p style="font-weight:bold;font-size:11.5pt;margin-bottom:4px;">PHẦN I. BẢNG ĐÁP ÁN TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (Mỗi câu đúng 0,25 điểm)</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;text-align:center;" border="1">
        <tr style="background:#f1f5f9;">
          <th style="padding:5px;">Câu</th>
          ${p1Items.map(it => `<th style="padding:5px;">${it.num}</th>`).join("")}
        </tr>
        <tr>
          <td style="font-weight:bold;padding:5px;">Chọn</td>
          ${p1Items.map(it => `<td style="font-weight:bold;color:#1d4ed8;padding:5px;">${it.key}</td>`).join("")}
        </tr>
      </table>

      <p style="font-weight:bold;font-size:11.5pt;margin-bottom:4px;">PHẦN II. BẢNG ĐÁP ÁN ĐÚNG/SAI & BAREM ĐIỂM CHUẨN CÔNG VĂN 7991</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:10px;text-align:center;" border="1">
        <tr style="background:#f1f5f9;">
          <th style="padding:5px;width:70px;">Câu</th>
          <th style="padding:5px;width:15%;">Lệnh hỏi a</th>
          <th style="padding:5px;width:15%;">Lệnh hỏi b</th>
          <th style="padding:5px;width:15%;">Lệnh hỏi c</th>
          <th style="padding:5px;width:15%;">Lệnh hỏi d</th>
          <th style="padding:5px;">Tóm tắt</th>
        </tr>
        ${p2Items.map((s, idx) => {
          let a = "-", b = "-", c = "-", d = "-";
          if(s.answers && typeof s.answers === "object"){
            a = s.answers.a || s.answers["1"] || "-";
            b = s.answers.b || s.answers["2"] || "-";
            c = s.answers.c || s.answers["3"] || "-";
            d = s.answers.d || s.answers["4"] || "-";
          } else if(typeof s.answers === "string"){
            const str = s.answers;
            const ma = str.match(/a\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
            const mb = str.match(/b\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
            const mc = str.match(/c\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
            const md = str.match(/d\s*[:\-\s]\s*(Đ|S|Đúng|Sai)/i);
            if(ma) a = ma[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
            if(mb) b = mb[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
            if(mc) c = mc[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
            if(md) d = md[1].toUpperCase().startsWith("Đ") ? "Đ" : "S";
          }
          return `
            <tr>
              <td style="font-weight:bold;padding:5px;">Câu ${s.num || (idx+1)}</td>
              <td style="font-weight:bold;padding:5px;color:${a==='Đ'?'#16a34a':'#dc2626'};">${a}</td>
              <td style="font-weight:bold;padding:5px;color:${b==='Đ'?'#16a34a':'#dc2626'};">${b}</td>
              <td style="font-weight:bold;padding:5px;color:${c==='Đ'?'#16a34a':'#dc2626'};">${c}</td>
              <td style="font-weight:bold;padding:5px;color:${d==='Đ'?'#16a34a':'#dc2626'};">${d}</td>
              <td style="text-align:left;padding:5px;font-size:10pt;">${s.summary || s.answers || ""}</td>
            </tr>
          `;
        }).join("")}
      </table>
      <div style="background:#f1f5f9;padding:6px 10px;margin-bottom:10px;font-size:10.5pt;border:1pt solid #cbd5e1;">
        <b>Barem tính điểm CV 7991:</b> Đúng 1 ý: 0,10 điểm · Đúng 2 ý: 0,25 điểm · Đúng 3 ý: 0,50 điểm · Đúng cả 4 ý: 1,00 điểm.
      </div>
      ${p2Items.map((s, idx) => `
        <div style="margin-bottom:6px;font-size:10.5pt;">
          <b>Câu ${s.num || (idx+1)}:</b> <i>${s.explanation || "Theo dữ kiện đề bài."}</i>
        </div>
      `).join("")}

      <p style="font-weight:bold;font-size:11.5pt;margin-top:16px;margin-bottom:4px;">PHẦN III. BẢNG ĐÁP SỐ TRẢ LỜI NGẮN & LỜI GIẢI TÓM TẮT (Mỗi câu đúng 0,5 điểm)</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;" border="1">
        <tr style="background:#f1f5f9;text-align:center;">
          <th style="padding:5px;width:70px;">Câu</th>
          <th style="padding:5px;width:25%;">Đáp số chuẩn</th>
          <th style="padding:5px;">Tóm tắt lời giải / Ghi chú</th>
          <th style="padding:5px;width:80px;">Điểm</th>
        </tr>
        ${p3Items.map((s, idx) => `
          <tr>
            <td style="font-weight:bold;padding:5px;text-align:center;">Câu ${s.num || (idx+1)}</td>
            <td style="font-weight:bold;padding:5px;color:#1d4ed8;text-align:center;">${s.answer || s.key || ""}</td>
            <td style="padding:5px;font-size:10.5pt;">${s.explanation || "Theo phép tính chuẩn."}</td>
            <td style="padding:5px;text-align:center;font-weight:bold;">0,5 đ</td>
          </tr>
        `).join("")}
      </table>
    `;
  }

  const finalHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title}</title>
<style>
  @page Section1 { size: 210mm 297mm; margin: 20mm 20mm 20mm 20mm; mso-header-margin: 35.4pt; mso-footer-margin: 35.4pt; }
  div.Section1 { page: Section1; }
  body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.45; color: #000; margin: 0; }
  table { border-collapse: collapse; }
</style>
</head>
<body>
<div class="Section1">
  ${docExamBody}
  ${docSolBody}
</div>
</body>
</html>`;

  const safeMaDe = maDeRaw.replace(/[^a-zA-Z0-9]/g, "");
  const suffix = mode === "solutions" ? "Dap-An-HD-Cham" : (mode === "all" ? "Tron-Bo-De-Va-Dap-An" : "De-Thi");
  const filename = `${safeMaDe || "101"}_${suffix}_${mon}_${lop}.doc`;

  const blob = new Blob(['\ufeff' + finalHtml], {type: 'application/msword;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   TOOL 03: MINDMAP TREE COMPILER (SƠ ĐỒ TƯ DUY RETRO A4)
   ========================================================================== */
function compileMindmapToHtml(data, formValues){
  const lesson = (data && (data.lesson_title || data.title)) || (formValues && formValues.bai) || "SƠ ĐỒ TƯ DUY BÀI HỌC";
  const mon = (data && data.subject) || (formValues && formValues.mon) || "Toán";
  const lop = (data && data.grade) || (formValues && formValues.lop) || "Lớp 12";
  const center = (data && data.central_node) || {};
  const branches = Array.isArray(data && data.branches) ? data.branches : [];

  let branchesHtml = "";
  if(branches.length > 0){
    branchesHtml = branches.map((b, idx) => {
      const bColor = b.color || ["#0284C7", "#10B981", "#F59E0B", "#EF4444"][idx % 4];
      const bIcon = b.icon || ["📌", "⚡", "🎯", "💡"][idx % 4];
      const bTitle = b.title || b.name || `Nhánh ${idx+1}`;
      const concepts = Array.isArray(b.concepts) ? b.concepts : [];

      return `
        <div class="mm-branch-card" style="border-top: 4px solid ${bColor};">
          <div class="mm-branch-head" style="color:${bColor};border-color:${bColor}40;">
            <span style="font-size:18px;">${bIcon}</span>
            <span>${escapeHtml(bTitle)}</span>
          </div>
          <div>
            ${concepts.map(c => `
              <div class="mm-concept-item">
                <div style="font-weight:700;color:#0F172A;margin-bottom:2px;">${escapeHtml(c.name || c.title || "")}</div>
                <div>${escapeHtml(c.content || c.desc || "")}</div>
                ${c.formula ? `<div style="margin-top:4px;padding:4px 8px;background:#fff;border-radius:4px;font-family:monospace;color:#2563EB;">${escapeHtml(c.formula)}</div>` : ''}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");
  } else {
    branchesHtml = `<div style="color:#64748B;">Nội dung các nhánh sơ đồ tư duy đang được nạp...</div>`;
  }

  let formulasHtml = "";
  if(data && Array.isArray(data.key_formulas) && data.key_formulas.length > 0){
    formulasHtml = `
      <div style="margin-top:20px;padding:14px;background:#F1F5F9;border-radius:10px;">
        <div style="font-weight:700;color:#0F172A;margin-bottom:6px;">⚡ BẢNG CÔNG THỨC TRỌNG TÂM CẦN NHỚ:</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${data.key_formulas.map(f => `<span style="background:#fff;padding:6px 12px;border:1px solid #CBD5E1;border-radius:6px;font-weight:600;color:#1E40AF;">${escapeHtml(f)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🧠 Sơ Đồ Tư Duy & Infographic</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn A4 / Xuất PDF
        </button>
        <button class="btn btn-ghost btn-sm" id="univDownloadHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải file HTML Sơ đồ
        </button>
      </div>
    </div>
    <div class="mindmap-container" id="printableUniversal">
      <div style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${escapeHtml(mon)} ${escapeHtml(lop)} · INFOGRAPHIC RETRO A4</div>
      <div class="mm-center-card">
        <div class="mm-center-title">${escapeHtml(lesson)}</div>
        <div style="font-size:14px;color:#94A3B8;max-width:640px;margin:0 auto;">${escapeHtml(center.overview || center.core_concept || "Sơ đồ kiến thức trọng tâm kết nối lý thuyết và phương pháp giải")}</div>
      </div>
      <div class="mm-branches-grid">
        ${branchesHtml}
      </div>
      ${formulasHtml}
      <div style="margin-top:20px;padding:12px 16px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:6px;font-size:13.5px;color:#92400E;">
        💡 <strong>Ghi nhớ cốt lõi:</strong> ${escapeHtml((data && data.summary_takeaway) || "Nắm chắc lý thuyết cơ bản và các dạng toán điển hình để tự tin xử lý mọi bài tập.")}
      </div>
      <div style="text-align:right;font-size:11.5px;color:#94A3B8;margin-top:16px;">Thiết kế bởi Math_DTH</div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 06: THREE-COLUMN INFOGRAPHIC COMPILER (BÀI TẬP THỰC TẾ)
   ========================================================================== */
function compileToanThucTeToHtml(dataOrText, formValues, showSolutions = false){
  let title = (formValues && formValues.chude) || "BÀI TẬP THỰC TẾ / VẬN DỤNG ĐỜI SỐNG";
  let styleName = "Sketchnote mực xanh chủ đạo";
  let items = [];

  if(typeof dataOrText === "object" && dataOrText !== null){
    title = dataOrText.title || title;
    styleName = dataOrText.style || styleName;
    if(Array.isArray(dataOrText.frames)){
      items = dataOrText.frames;
    } else if(Array.isArray(dataOrText.pages)){
      dataOrText.pages.forEach(p => {
        if(Array.isArray(p.items)) items = items.concat(p.items);
      });
    } else if(Array.isArray(dataOrText.items)){
      items = dataOrText.items;
    }
  }

  let cardsHtml = "";
  if(items.length > 0){
    cardsHtml = items.map((it, idx) => {
      const qNum = it.frame_num || it.question_num || (idx + 1);
      const levelBadge = it.level ? `<span class="badge" style="background:#DBEAFE;color:#1E40AF;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;margin-left:6px;">${escapeHtml(it.level)}</span>` : "";
      const qTitle = it.title ? `<div style="font-weight:700;color:#1E3A8A;margin-bottom:6px;font-size:13.5px;">${escapeHtml(it.title)}</div>` : "";
      const prob = it.col1_problem || it.problem || "Đề bài thực tế...";
      
      let illuHtml = "";
      if(it.col2_illustration && typeof it.col2_illustration === "object"){
        const tikz = it.col2_illustration.math_layer_tikz || "";
        const art = it.col2_illustration.art_layer_image_prompt || "";
        illuHtml = `
          <div style="text-align:left;margin-bottom:10px;">
            <div style="font-size:11.5px;font-weight:700;color:#1E40AF;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span>📐</span><span>MATH LAYER (Mã TikZ chuẩn xác):</span>
            </div>
            <pre style="font-family:Consolas, Monaco, monospace;font-size:11px;background:#ffffff;padding:8px 10px;border-radius:6px;border:1px solid #BFDBFE;overflow-x:auto;margin:0;white-space:pre-wrap;color:#0F172A;line-height:1.5;">${escapeHtml(tikz)}</pre>
          </div>
          <div style="text-align:left;">
            <div style="font-size:11.5px;font-weight:700;color:#0369A1;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span>🎨</span><span>ART LAYER (Prompt tạo ảnh Sketchnote):</span>
            </div>
            <div style="font-size:11px;line-height:1.5;background:#F0F9FF;padding:8px 10px;border-radius:6px;border:1px solid #BAE6FD;color:#0369A1;font-style:italic;">${escapeHtml(art)}</div>
          </div>
        `;
      } else {
        const illuText = it.col2_illustration || it.col2_tikz_illustration || it.illustration || "[Hình vẽ / Sơ đồ minh họa TikZ]";
        illuHtml = `
          <pre style="font-family:Consolas, Monaco, monospace;font-size:11px;background:#ffffff;padding:8px 10px;border-radius:6px;border:1px solid #BFDBFE;overflow-x:auto;margin:0;white-space:pre-wrap;color:#0F172A;line-height:1.5;">${escapeHtml(String(illuText))}</pre>
        `;
      }

      const sol = it.col3_teacher_solution || it.col3_solution || it.solution || "";
      const ruledLines = it.col3_ruled_lines || it.col3_student_blank_lines || "";
      const isDisplaySol = Boolean(sol && (showSolutions || !ruledLines));

      return `
        <div class="three-col-card" style="border:1.5px solid #93C5FD;border-radius:12px;box-shadow:0 3px 12px rgba(37,99,235,0.06);margin-bottom:22px;background:#fff;">
          <div class="col-sec col-sec-prob" style="background:#F8FAFC;border-right:1.5px solid #E2E8F0;padding:16px;">
            <div class="col-sec-title" style="color:#0F172A;font-weight:800;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
              <span>📝</span> <span>Khung ${qNum} - Cột 1: Đề bài</span> ${levelBadge}
            </div>
            ${qTitle}
            <div style="font-size:13.5px;line-height:1.7;color:#1E293B;white-space:pre-wrap;">${escapeHtml(prob)}</div>
          </div>
          <div class="col-sec col-sec-illu" style="background:#F0F7FF;border-right:1.5px solid #DBEAFE;padding:16px;">
            <div class="col-sec-title" style="color:#1D4ED8;font-weight:800;font-size:13px;border-bottom:1px solid #DBEAFE;padding-bottom:6px;margin-bottom:10px;">
              <span>📐</span> <span>Cột 2: Hình minh họa (Math & Art Lock)</span>
            </div>
            ${illuHtml}
          </div>
          <div class="col-sec col-sec-sol" style="background:${isDisplaySol ? '#F0FDF4' : '#FAFCFF'};padding:16px;">
            <div class="col-sec-title" style="color:${isDisplaySol ? '#15803D' : '#1E40AF'};font-weight:800;font-size:13px;border-bottom:1px solid ${isDisplaySol ? '#BBF7D0' : '#DBEAFE'};padding-bottom:6px;margin-bottom:10px;">
              <span>${isDisplaySol ? '💡' : '✏️'}</span> <span>Cột 3: ${isDisplaySol ? 'Lời giải chi tiết & Đáp số' : 'Dòng kẻ làm bài (Học sinh)'}</span>
            </div>
            ${isDisplaySol ? `
              <div style="font-size:13px;line-height:1.7;color:#166534;white-space:pre-wrap;background:#fff;padding:12px;border-radius:8px;border:1px solid #BBF7D0;">
                ${escapeHtml(sol)}
              </div>` : `
              <div style="font-family:'Be Vietnam Pro',sans-serif;font-size:13px;line-height:2.2;color:#1E40AF;background:repeating-linear-gradient(transparent, transparent 27px, #BFDBFE 28px);padding:6px 12px;min-height:160px;border-radius:6px;white-space:pre-wrap;">
                ${ruledLines ? escapeHtml(ruledLines) : `...........................................................................................\n...........................................................................................\n...........................................................................................\n...........................................................................................\nĐáp số: ....................`}
              </div>`}
          </div>
        </div>
      `;
    }).join("");
  } else {
    cardsHtml = `
      <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14.5px;line-height:1.7;padding:16px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;">
        ${escapeHtml(String(dataOrText))}
      </div>
    `;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>📊 Bài Tập Thực Tế Infographic 3 Cột (KNTT)</span>
        <span class="badge" style="background:#DBEAFE;color:#1E40AF;font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:12px;">MATH FIGURE LOCK</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;box-shadow:0 2px 4px rgba(37,99,235,0.2);">
          🖨️ In ấn / Xuất PDF (3:4)
        </button>
        <button class="btn btn-ghost btn-sm" id="univDownloadHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải file HTML
        </button>
      </div>
    </div>
    <div class="three-col-container" id="printableUniversal" style="background:#F8FAFC;padding:24px;border-radius:0 0 12px 12px;border:1px solid var(--paper-edge);border-top:none;">
      <div style="background:#ffffff;border:2px solid #2563EB;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;box-shadow:0 4px 12px rgba(37,99,235,0.08);">
        <div style="font-weight:900;font-size:20px;color:#1E3A8A;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(title)}</div>
        <div style="display:flex;justify-content:center;gap:16px;font-size:12.5px;color:#475569;margin-top:6px;font-weight:600;flex-wrap:wrap;">
          <span>📚 Bộ sách: Kết nối tri thức với cuộc sống</span>
          <span>📐 Quy chuẩn: Math Layer & Art Layer</span>
          <span>🎨 Phong cách: ${escapeHtml(styleName)}</span>
          <span>📄 Khổ in: Tỷ lệ 3:4 (A4)</span>
        </div>
      </div>
      ${cardsHtml}
    </div>
  `;
}

/* ==========================================================================
   TOOL 07: COMIC STRIP COMPILER (TRUYỆN TRANH GIÁO DỤC)
   ========================================================================== */
function compileComicToHtml(rawText, formValues){
  const charStyle = (formValues && formValues.phongcach) || "Truyện tranh";
  const lines = String(rawText).split("\n");
  let panels = [];
  let curPanel = null;

  lines.forEach(l => {
    const trimmed = l.trim();
    if(trimmed.match(/^(Cảnh|Canh|Panel)\s*\d+/i) || trimmed.startsWith("## Cảnh") || trimmed.startsWith("### Cảnh")){
      if(curPanel) panels.push(curPanel);
      curPanel = { title: trimmed.replace(/^[#\s]+/, ""), body: [] };
    } else if(curPanel){
      if(trimmed) curPanel.body.push(trimmed);
    }
  });
  if(curPanel) panels.push(curPanel);

  let panelsHtml = "";
  if(panels.length > 0){
    panelsHtml = panels.map((p, idx) => {
      let descHtml = "";
      let dialogueHtml = "";

      p.body.forEach(b => {
        // Detect dialogue in single quotes or with character colon
        const dMatch = b.match(/^([A-Za-z0-9\s\u00C0-\u024F\u1EA0-\u1EF9]+)[:：]\s*['"“](.*?)['"”]$/);
        if(dMatch){
          dialogueHtml += `
            <div class="comic-speech-bubble">
              <strong>💬 ${escapeHtml(dMatch[1].trim())}:</strong> "${escapeHtml(dMatch[2].trim())}"
            </div>
          `;
        } else {
          descHtml += `<p style="margin:4px 0;font-size:13.5px;color:#334155;">${escapeHtml(b)}</p>`;
        }
      });

      return `
        <div class="comic-panel">
          <div class="comic-panel-header">
            <span>🎬 ${escapeHtml(p.title || `Khung ${idx+1}`)}</span>
            <span style="font-size:11px;background:#0F172A;color:#FEF08A;padding:2px 8px;border-radius:10px;">${escapeHtml(charStyle.split("(")[0])}</span>
          </div>
          <div class="comic-panel-body">
            ${descHtml}
            ${dialogueHtml}
          </div>
        </div>
      `;
    }).join("");
  } else {
    panelsHtml = `
      <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;line-height:1.7;">
        ${escapeHtml(String(rawText))}
      </div>
    `;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🎨 Truyện Tranh Giáo Dục Tương Tác</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn / Xuất PDF
        </button>
        <button class="btn btn-ghost btn-sm" id="univDownloadHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải file HTML
        </button>
      </div>
    </div>
    <div class="comic-container" id="printableUniversal">
      <div style="text-align:center;font-weight:800;font-size:18px;margin-bottom:4px;">KỊCH BẢN TRUYỆN TRANH BÀI HỌC (${escapeHtml(charStyle)})</div>
      <div style="text-align:center;color:#64748B;font-size:13px;margin-bottom:20px;">Lồng ghép khéo léo lời thoại nhân vật và tri thức bài giảng</div>
      <div class="comic-grid">
        ${panelsHtml}
      </div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 10: CLIL BILINGUAL FLASHCARDS COMPILER (DẠY HỌC SONG NGỮ)
   ========================================================================== */
function compileClilToHtml(dataOrText, formValues){
  const title = (formValues && formValues.chude) || "DẠY HỌC SONG NGỮ CLIL";
  const mon = (formValues && formValues.mon) || "Toán";
  const lop = (formValues && formValues.lop) || "Lớp 12";

  // Parse lines for vocabulary items
  const lines = String(dataOrText).split("\n");
  let vocabs = [];
  lines.forEach(l => {
    const m = l.match(/([A-Za-z\s-]+)\s*(\/[^\/]+\/)?\s*[:：-]\s*(.*)/);
    if(m && m[1].trim().length > 2 && !m[1].includes("PHẦN") && !m[1].includes("MỤC")){
      vocabs.push({ en: m[1].trim(), ipa: m[2] ? m[2].trim() : "", vi: m[3].trim() });
    }
  });

  let cardsHtml = "";
  if(vocabs.length > 0){
    cardsHtml = `
      <div class="clil-vocab-grid">
        ${vocabs.map(v => `
          <div class="clil-card">
            <div class="clil-term-en">${escapeHtml(v.en)}</div>
            ${v.ipa ? `<div class="clil-ipa">${escapeHtml(v.ipa)}</div>` : ''}
            <div class="clil-term-vi">🇻🇳 ${escapeHtml(v.vi)}</div>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    cardsHtml = `
      <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;line-height:1.7;padding:16px;background:#F8FAFC;border-radius:8px;">
        ${escapeHtml(String(dataOrText))}
      </div>
    `;
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🇬🇧 Bộ Thẻ Song Ngữ & Giáo Án CLIL</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn A4 / Xuất PDF
        </button>
        <button class="btn btn-ghost btn-sm" id="univDownloadHtmlBtn" style="font-size:12px;color:#10B981;border-color:rgba(16,185,129,0.4);">
          💾 Tải file HTML
        </button>
      </div>
    </div>
    <div class="clil-container" id="printableUniversal">
      <div style="text-align:center;font-weight:800;font-size:18px;margin-bottom:4px;">BÀI HỌC SONG NGỮ (CLIL): ${escapeHtml(title.toUpperCase())}</div>
      <div style="text-align:center;color:#64748B;font-size:13px;margin-bottom:20px;">Môn ${escapeHtml(mon)} - ${escapeHtml(lop)} · Chuẩn thuật ngữ quốc tế & mẫu câu giao tiếp lớp học</div>
      ${cardsHtml}
    </div>
  `;
}

/* ==========================================================================
   TOOL 11: CHARACTER DOSSIER COMPILER (HỒ SƠ KHÓA NHÂN VẬT)
   ========================================================================== */
function compileCharacterToHtml(rawText, formValues){
  const name = (formValues && formValues.ten_nv) || "Nhân vật";
  const style = (formValues && formValues.phong_cach) || "3D Pixar";

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>👤 Hồ Sơ Khóa Nhân Vật Đồng Nhất</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn hồ sơ
        </button>
      </div>
    </div>
    <div class="character-dossier-wrap" id="printableUniversal">
      <div class="dossier-card">
        <div class="dossier-header">
          <div>
            <div style="font-size:20px;font-weight:800;color:#0F172A;">HỒ SƠ NHÂN VẬT: ${escapeHtml(name.toUpperCase())}</div>
            <div style="font-size:13px;color:#64748B;margin-top:2px;">Phong cách: <strong>${escapeHtml(style)}</strong> · Khóa cố định nhận diện 100%</div>
          </div>
          <div style="background:#2563EB;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">CHARACTER LOCK</div>
        </div>
        <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;line-height:1.75;color:#1E293B;">
          ${escapeHtml(String(rawText))}
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 04: GEOGEBRA WEB RUNNER COMPILER (SCRIPT GEOGEBRA)
   ========================================================================== */
function compileGeogebraEmbed(scriptText, formValues){
  const cleanScript = String(scriptText).replace(/```[a-z]*\n?/g, '').trim();

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>📐 Trình Chạy Script GeoGebra Trực Tuyến</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-ghost btn-sm" id="copyGgbScriptBtn" style="font-size:12px;color:#0284C7;border-color:rgba(2,132,199,0.4);">
          📋 Copy toàn bộ Script GeoGebra
        </button>
        <a href="https://www.geogebra.org/classic" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🚀 Mở GeoGebra Fullscreen
        </a>
      </div>
    </div>
    <div class="geogebra-runner-wrap" id="printableUniversal">
      <div style="margin-bottom:12px;font-size:13px;color:#64748B;">
        💡 <strong>Hướng dẫn:</strong> Script GeoGebra bên dưới đã sẵn sàng. Bạn có thể copy nhanh hoặc tương tác trực tiếp trên giao diện GeoGebra nhúng:
      </div>
      <div class="geogebra-box">
        <iframe src="https://www.geogebra.org/classic?embed" style="width:100%;height:520px;border:none;" allowfullscreen></iframe>
      </div>
      <div style="margin-top:16px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px;">Mã lệnh GeoGebra Script sinh ra:</div>
        <pre style="background:#0F172A;color:#F8FAFC;padding:14px;border-radius:8px;font-family:monospace;font-size:13px;max-height:240px;overflow:auto;margin:0;">${escapeHtml(cleanScript)}</pre>
      </div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 01: STORYBOARD VEO 3 COMPILER
   ========================================================================== */
function compileStoryboardToHtml(rawText, formValues){
  const lesson = (formValues && formValues.bai_hoc) || "Video Khởi Động";
  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🎬 Storyboard Phân Cảnh Video Veo 3</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn Storyboard
        </button>
      </div>
    </div>
    <div class="worksheet-container" id="printableUniversal">
      <div style="font-size:18px;font-weight:800;margin-bottom:4px;color:#0F172A;">STORYBOARD & KỊCH BẢN VEO 3: ${escapeHtml(lesson.toUpperCase())}</div>
      <div style="font-size:13px;color:#64748B;margin-bottom:20px;">Thời lượng chuẩn: 6-8s/cảnh · Khóa cố định nhân vật & góc máy POV</div>
      <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;line-height:1.75;">
        ${escapeHtml(String(rawText))}
      </div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 16: SOCIAL MEDIA POSTER COMPILER (POSTER QUỐC KHÁNH / AI ART)
   ========================================================================== */
function compilePosterToHtml(dataOrText, formValues){
  const suKien = (formValues && formValues.su_kien && formValues.su_kien.trim()) || "Quốc khánh Việt Nam 2/9";
  const slogan = (formValues && formValues.text_chinh) || (suKien.includes("2/9") ? "TỰ HÀO VIỆT NAM" : suKien.toUpperCase());
  const sub = (formValues && formValues.text_phu) || `Sự kiện: ${suKien}`;
  const style = (formValues && formValues.phong_cach) || "cinematic patriotic";

  const isNational = /quốc khánh|2\/9|02\/09|dân tộc|yêu nước/i.test(suKien);
  const isEdu = /khai giảng|20\/11|20-11|nhà giáo|thầy cô|tựu trường|học|trường/i.test(suKien);
  const isTech = /stem|toán|khoa học|công nghệ|robotic|ai/i.test(suKien);

  let bgGrad = "linear-gradient(135deg,#1E293B,#0F172A)";
  let icon = "🎉";
  let headerText = escapeHtml(suKien.toUpperCase());
  let badgeColor = "#38BDF8";

  if(isNational){
    bgGrad = "linear-gradient(135deg,#991B1B,#B91C1C)";
    icon = "⭐";
    headerText = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM";
    badgeColor = "#FEF08A";
  } else if(isEdu){
    bgGrad = "linear-gradient(135deg,#1E3A8A,#1D4ED8)";
    icon = "🎓";
    badgeColor = "#93C5FD";
  } else if(isTech){
    bgGrad = "linear-gradient(135deg,#064E3B,#047857)";
    icon = "🔬";
    badgeColor = "#6EE7B7";
  }

  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🚩 Poster Sự Kiện & AI Art</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">${escapeHtml(suKien)}</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="renderAiImgBtn2" style="font-size:12px;background:#E1523D;color:#fff;border:none;">
          🎨 Biên dịch ảnh Poster ngay
        </button>
      </div>
    </div>
    <div class="worksheet-container" id="printableUniversal" style="text-align:center;padding:32px 20px;">
      <div style="display:inline-block;background:${bgGrad};color:#FEF08A;padding:40px 28px;border-radius:16px;max-width:440px;width:100%;box-shadow:0 8px 30px rgba(0,0,0,0.3);border:3px solid ${badgeColor};">
        <div style="font-size:13px;letter-spacing:2px;font-weight:700;text-transform:uppercase;color:${badgeColor};">${headerText}</div>
        <div style="font-size:48px;margin:16px 0;">${icon}</div>
        <div style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:#FFFFFF;">${escapeHtml(slogan)}</div>
        <div style="font-size:14px;color:#FEF9C3;margin-bottom:20px;">${escapeHtml(sub)}</div>
        <div style="font-size:11.5px;color:#CBD5E1;border-top:1px dashed rgba(255,255,255,0.3);padding-top:12px;">Sự kiện: ${escapeHtml(suKien)} · Phong cách: ${escapeHtml(style)}</div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   TOOL 13: EXAM SOLUTIONS BOOKLET COMPILER
   ========================================================================== */
function compileSolutionBookletToHtml(rawText, formValues){
  const title = (formValues && formValues.tieu_de_de) || "HƯỚNG DẪN CHẤM & ĐÁP ÁN CHI TIẾT";
  return `
    <div class="worksheet-toolbar">
      <div class="worksheet-toolbar-title">
        <span>🔑 Sổ Tay Đáp Án & Barem Điểm</span>
        <span class="badge" style="background:#E2E8F0;color:#334155;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;">Đã kết nối Prompt</span>
      </div>
      <div class="worksheet-toolbar-actions">
        <button class="btn btn-primary btn-sm" id="univPrintBtn" style="font-size:12px;background:#2563EB;color:#fff;border:none;">
          🖨️ In ấn A4 / Xuất PDF
        </button>
      </div>
    </div>
    <div class="exam-container" id="printableUniversal">
      <div style="font-size:18px;font-weight:800;margin-bottom:4px;text-align:center;">${escapeHtml(title.toUpperCase())}</div>
      <div style="font-size:13px;color:#64748B;text-align:center;margin-bottom:20px;">Bao gồm Bảng đáp án nhanh, Lời giải chi tiết và Phân tích cạm bẫy học sinh</div>
      <div style="white-space:pre-wrap;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;line-height:1.75;">
        ${escapeHtml(String(rawText))}
      </div>
    </div>
  `;
}

/* ==========================================================================
   UNIVERSAL VISUAL DISPATCHER & RENDERER (ALL TOOLS)
   ========================================================================== */
function renderUniversalVisualView(toolId, dataOrText, formValues, showSolutions = false){
  const wrap = document.getElementById("worksheetPreview");
  if(!wrap) return;

  let html = "";
  if(toolId === "phieu-hoc-tap"){
    html = compileWorksheetToHtml(dataOrText, formValues, showSolutions);
  } else if(toolId === "de-22-cau"){
    html = compileExamToHtml(dataOrText, formValues, showSolutions);
  } else if(toolId === "mindmap"){
    html = compileMindmapToHtml(dataOrText, formValues);
  } else if(toolId === "toan-thuc-te"){
    html = compileToanThucTeToHtml(dataOrText, formValues, showSolutions);
  } else if(toolId === "truyen-tranh"){
    html = compileComicToHtml(dataOrText, formValues);
  } else if(toolId === "geogebra"){
    html = compileGeogebraEmbed(dataOrText, formValues);
  } else if(toolId === "toan-tieng-anh-clil"){
    html = compileClilToHtml(dataOrText, formValues);
  } else if(toolId === "tao-nhan-vat"){
    html = compileCharacterToHtml(dataOrText, formValues);
  } else if(toolId === "video-veo3"){
    html = compileStoryboardToHtml(dataOrText, formValues);
  } else if(toolId === "tao-poster-quoc-khanh"){
    html = compilePosterToHtml(dataOrText, formValues);
  } else if(toolId === "giai-de-dap-an"){
    html = compileSolutionBookletToHtml(dataOrText, formValues);
  } else {
    html = `<div style="padding:20px;font-size:14px;">${escapeHtml(String(dataOrText))}</div>`;
  }

  wrap.innerHTML = html;

  // Universal button listeners
  const toggleBtn = document.getElementById("univToggleSolBtn");
  if(toggleBtn){
    toggleBtn.addEventListener("click", ()=>{
      renderUniversalVisualView(toolId, dataOrText, formValues, !showSolutions);
    });
  }
  const printBtn = document.getElementById("univPrintBtn");
  if(printBtn){
    printBtn.addEventListener("click", ()=>{
      window.print();
    });
  }

  // Event listeners dành riêng cho Tool 05: Đề kiểm tra chuẩn CV 7991
  if(toolId === "de-22-cau"){
    const vExamBtn = document.getElementById("examViewExamBtn");
    if(vExamBtn){
      vExamBtn.addEventListener("click", ()=>{
        renderUniversalVisualView(toolId, dataOrText, formValues, "exam");
      });
    }
    const vSolBtn = document.getElementById("examViewSolBtn");
    if(vSolBtn){
      vSolBtn.addEventListener("click", ()=>{
        renderUniversalVisualView(toolId, dataOrText, formValues, "solutions");
      });
    }
    const vAllBtn = document.getElementById("examViewAllBtn");
    if(vAllBtn){
      vAllBtn.addEventListener("click", ()=>{
        renderUniversalVisualView(toolId, dataOrText, formValues, "all");
      });
    }
    const printExamBtn = document.getElementById("examPrintBtn");
    if(printExamBtn){
      printExamBtn.addEventListener("click", ()=>{
        window.print();
      });
    }
    const docExamBtn = document.getElementById("examDocExamBtn");
    if(docExamBtn){
      docExamBtn.addEventListener("click", ()=>{
        exportExamToWord("exam", dataOrText, formValues);
      });
    }
    const docSolBtn = document.getElementById("examDocSolBtn");
    if(docSolBtn){
      docSolBtn.addEventListener("click", ()=>{
        exportExamToWord("solutions", dataOrText, formValues);
      });
    }
    const docAllBtn = document.getElementById("examDocAllBtn");
    if(docAllBtn){
      docAllBtn.addEventListener("click", ()=>{
        exportExamToWord("all", dataOrText, formValues);
      });
    }
    const htmlExamBtn = document.getElementById("examHtmlBtn");
    if(htmlExamBtn){
      htmlExamBtn.addEventListener("click", ()=>{
        const printableEl = document.getElementById("printableUniversal") || wrap;
        const solsEl = document.getElementById("printableSolutions");
        let exportBody = printableEl ? printableEl.outerHTML : "";
        if(showSolutions === "solutions" && solsEl){
          exportBody = solsEl.outerHTML;
        } else if(showSolutions === "all" && solsEl){
          exportBody = (printableEl ? printableEl.outerHTML : "") + solsEl.outerHTML;
        }
        const content = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml((formValues && formValues.tieude) || "De-Kiem-Tra-CV7991")}</title>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body { font-family: 'Times New Roman', serif; background: #fff; margin: 0; padding: 24px; color: #000; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; }
    .exam-ans-table th, .exam-ans-table td { border: 1px solid #000; padding: 6px; text-align: center; }
    .exam-code-box { border: 1.5px solid #000; display: inline-block; padding: 2px 10px; font-weight: 700; margin-top: 4px; }
    .exam-divider-line { height: 2px; background: #000; margin: 12px 0 16px; }
    .exam-student-info { border: 1px solid #000; padding: 8px 14px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .exam-tf-box { display: flex; justify-content: space-between; padding: 4px 8px; border: 1px solid #ccc; margin: 4px 0; }
    .exam-page-break { page-break-before: always; margin-top: 30px; }
  </style>
</head>
<body>
  ${exportBody}
</body>
</html>`;
        const blob = new Blob([content], { type: "text/html;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `De-Kiem-Tra-CV7991-${showSolutions || 'exam'}.html`;
        a.click();
      });
    }
  }
  const dlBtn = document.getElementById("univDownloadHtmlBtn");
  if(dlBtn){
    dlBtn.addEventListener("click", ()=>{
      const printableEl = document.getElementById("printableUniversal") || wrap;
      const content = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(toolId)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap">
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body { font-family: 'Be Vietnam Pro', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
  </style>
</head>
<body>
  ${printableEl.outerHTML}
</body>
</html>`;
      const blob = new Blob([content], { type: "text/html;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${toolId}-export.html`;
      a.click();
    });
  }
  const copyGgbBtn = document.getElementById("copyGgbScriptBtn");
  if(copyGgbBtn){
    copyGgbBtn.addEventListener("click", async ()=>{
      await copyToClipboard(String(dataOrText));
      copyGgbBtn.textContent = "✓ Đã copy Script";
      setTimeout(()=> copyGgbBtn.textContent = "📋 Copy toàn bộ Script GeoGebra", 1800);
    });
  }
  const renderPosterBtn = document.getElementById("renderAiImgBtn2");
  if(renderPosterBtn){
    renderPosterBtn.addEventListener("click", ()=>{
      document.getElementById("renderAiImgBtn").click();
    });
  }

  // Typeset MathJax
  if(window.MathJax && window.MathJax.typesetPromise){
    window.MathJax.typesetPromise([wrap]).catch(err=>console.error("MathJax err:", err));
  }
}

/* --- COPY, DOWNLOAD & EDIT ACTIONS --- */
async function copyToClipboard(text){
  if(navigator.clipboard && window.isSecureContext){
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch(e){}
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch(err){
    document.body.removeChild(ta);
    return false;
  }
}

document.getElementById("copyBtn").addEventListener("click", async ()=>{
  if(!window.__lastOutput) return;
  const success = await copyToClipboard(window.__lastOutput);
  const b = document.getElementById("copyBtn");
  const orig = b.innerHTML;
  if(success){
    b.innerHTML = "✓ Đã sao chép";
  } else {
    b.innerHTML = "Lỗi sao chép";
  }
  setTimeout(()=> b.innerHTML = orig, 1800);
});

/* --- DIRECT AI IMAGE & TIKZ RENDERERS --- */
document.getElementById("renderAiImgBtn").addEventListener("click", async ()=>{
  if(!window.__lastOutput) return;
  const wrap = document.getElementById("aiImageRenderWrap");
  if(!wrap) return;

  wrap.style.display = "block";
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let parsed = null;
  try {
    parsed = JSON.parse(window.__lastOutput);
  } catch(e){}

  const formValues = window.__lastFormValues || (currentTool ? formValuesCache[currentTool.id] : {}) || {};
  const currentToolId = (currentTool && currentTool.id) || window.__lastToolId || "phieu-hoc-tap";
  const currentToolName = (currentTool && currentTool.name) || "Trực quan";
  const compiledPrompt = compileUniversalImagePrompt(currentToolId, parsed || window.__lastOutput, formValues);

  const tile = (formValues && (formValues.tile || formValues.ty_le)) || (parsed && (parsed.aspect_ratio || parsed.ty_le)) || "9:16";
  let width = 768;
  let height = 1365;
  if(tile === "3:4"){
    width = 768;
    height = 1024;
  } else if(tile === "4:5"){
    width = 800;
    height = 1000;
  } else if(tile === "16:9"){
    width = 1280;
    height = 720;
  } else if(tile === "1:1"){
    width = 1024;
    height = 1024;
  }

  const seed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = compiledPrompt.replace(/[\r\n]+/g, ' ').trim();
  const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

  wrap.innerHTML = `
    <div style="font-size:13.5px;font-weight:700;color:#0F172A;margin-bottom:10px;text-align:left;">
      🎨 Bộ Biên Dịch Ảnh AI Kết Nối Prompt Khởi Tạo (${escapeHtml(currentToolName)})
    </div>
    <div class="compiled-prompt-card">
      <div class="compiled-prompt-header">
        <span>📐 PROMPT AI ĐÃ BIÊN DỊCH (Chuẩn Midjourney v6 / Flux / DALL-E):</span>
        <span style="font-size:11px;background:#E2E8F0;padding:2px 8px;border-radius:10px;color:#334155;">Tỉ lệ: ${escapeHtml(tile)} · ${width}x${height}</span>
      </div>
      <div class="compiled-prompt-text" id="compiledPromptDisplay">${escapeHtml(cleanPrompt)}</div>
      <div style="margin-top:8px;display:flex;gap:8px;">
        <button type="button" class="btn btn-ghost btn-sm" id="copyCompiledPromptBtn" style="font-size:11.5px;color:#0284C7;border-color:rgba(2,132,199,0.4);">📋 Sao chép Prompt tiếng Anh</button>
      </div>
    </div>
    <div id="aiImageLoadingBox" class="status loading" style="margin-top:10px;">
      <span class="spinner"></span> Đang kết nối mô hình Flux/Pollinations để sinh ảnh trực tiếp từ thông số đã biên dịch...
    </div>
    <div id="aiImageResultBox" style="display:none;margin-top:12px;"></div>
  `;

  document.getElementById("copyCompiledPromptBtn").addEventListener("click", async (e)=>{
    await copyToClipboard(cleanPrompt);
    e.target.innerHTML = "✓ Đã sao chép prompt";
    setTimeout(()=> e.target.innerHTML = "📋 Sao chép Prompt tiếng Anh", 1800);
  });

  const img = new Image();
  img.onload = function(){
    const loadBox = document.getElementById("aiImageLoadingBox");
    const resBox = document.getElementById("aiImageResultBox");
    if(loadBox) loadBox.style.display = "none";
    if(resBox){
      resBox.style.display = "block";
      resBox.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:#123832;margin-bottom:6px;">✨ Ảnh minh họa / Poster được tạo từ Prompt (${escapeHtml(currentToolName)}):</div>
        <img src="${imgUrl}" alt="AI Generated Graphic" />
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <a href="${imgUrl}" target="_blank" download="ai-graphic.jpg" class="btn btn-primary btn-sm" style="background:#4EBA74;border:none;">💾 Tải ảnh về máy</a>
          <a href="${imgUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="color:#123832;">👁 Xem ảnh gốc kích thước lớn</a>
          <button type="button" class="btn btn-ghost btn-sm" id="refreshAiImgSeed" style="color:#0284C7;border-color:rgba(2,132,199,0.4);">🎲 Thử biến thể khác (New Seed)</button>
          <button type="button" class="btn btn-ghost btn-sm" id="viewRealWorksheetBtn" style="color:#2563EB;border-color:rgba(37,99,235,0.4);">👁 Xem bản biên dịch trực quan (${escapeHtml(currentToolName)})</button>
        </div>
      `;
      const refBtn = document.getElementById("refreshAiImgSeed");
      if(refBtn){
        refBtn.addEventListener("click", ()=>{
          document.getElementById("renderAiImgBtn").click();
        });
      }
      const viewWsBtn = document.getElementById("viewRealWorksheetBtn");
      if(viewWsBtn){
        viewWsBtn.addEventListener("click", ()=>{
          const tabPrev = document.getElementById("tabPreview");
          if(tabPrev) tabPrev.click();
          const wsWrap = document.getElementById("worksheetPreview");
          if(wsWrap) wsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  };
  img.onerror = function(){
    const loadBox = document.getElementById("aiImageLoadingBox");
    if(loadBox){
      loadBox.className = "status err";
      loadBox.innerHTML = `Lỗi kết nối máy chủ sinh ảnh tự động. Bạn vẫn có thể sao chép đoạn <strong>Prompt tiếng Anh đã biên dịch ở trên</strong> để dán trực tiếp vào ChatGPT, Midjourney hoặc Canva!`;
    }
  };
  img.src = imgUrl;
});

document.getElementById("renderTikzBtn").addEventListener("click", async ()=>{
  if(!window.__lastOutput) return;
  const wrap = document.getElementById("tikzRenderWrap");
  if(!wrap) return;

  wrap.style.display = "block";
  wrap.innerHTML = `
    <div style="font-size:13px;font-weight:600;color:#123832;margin-bottom:8px;">📐 Đang render hình TikZ / Đồ thị trực tiếp...</div>
    <div class="status loading"><span class="spinner"></span> Đang tạo hình vector SVG/PNG từ mã TikZ...</div>`;
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });

  let text = window.__lastOutput;
  let tikzCode = text;
  const match = text.match(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/i);
  if(match) tikzCode = match[0];

  const fullLatex = `\\documentclass[tikz,border=2pt]{standalone}
\\usepackage{tikz,tkz-tab,amsmath,amssymb}
\\begin{document}
${tikzCode}
\\end{document}`;

  try {
    const res = await fetch("https://quicklatex.com/latex3.f", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        formula: fullLatex,
        fsize: "17px",
        fcolor: "000000",
        mode: "0",
        out: "1",
        remhost: "quicklatex.com"
      })
    });
    const resText = await res.text();
    const parts = resText.split(/\s+/);
    if(parts[0] === "0" && parts[1]){
      const imgUrl = parts[1];
      wrap.innerHTML = `
        <div style="font-size:13px;font-weight:700;color:#123832;margin-bottom:6px;">✨ Hình vẽ TikZ / Đồ thị hoàn chỉnh:</div>
        <img src="${imgUrl}" alt="TikZ Rendered Diagram" />
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;">
          <a href="${imgUrl}" target="_blank" download="tikz-diagram.png" class="btn btn-primary btn-sm" style="background:#4EBA74;border:none;">💾 Tải hình TikZ về máy</a>
          <a href="${imgUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="color:#123832;">👁 Xem hình trong tab mới</a>
        </div>`;
    } else {
      throw new Error("Lỗi biên dịch mã TikZ từ server QuickLaTeX. Vui lòng kiểm tra cú pháp lệnh.");
    }
  } catch(err){
    wrap.innerHTML = `<div class="status err">Lỗi render TikZ: ${escapeHtml(err.message)}</div>`;
  }
});


const editOutputBtn = document.getElementById("editOutputBtn");
const saveEditOutputBtn = document.getElementById("saveEditOutputBtn");
const cancelEditOutputBtn = document.getElementById("cancelEditOutputBtn");
const outputTextEl = document.getElementById("outputText");
const outputTextEditEl = document.getElementById("outputTextEdit");

editOutputBtn.addEventListener("click", ()=>{
  if(!window.__lastOutput && !outputTextEl.textContent) return;
  outputTextEditEl.value = window.__lastOutput || outputTextEl.textContent;
  outputTextEl.style.display = "none";
  outputTextEditEl.style.display = "block";
  editOutputBtn.style.display = "none";
  saveEditOutputBtn.style.display = "inline-flex";
  cancelEditOutputBtn.style.display = "inline-flex";
  outputTextEditEl.focus();
});

cancelEditOutputBtn.addEventListener("click", ()=>{
  outputTextEditEl.style.display = "none";
  outputTextEl.style.display = "block";
  editOutputBtn.style.display = "inline-flex";
  saveEditOutputBtn.style.display = "none";
  cancelEditOutputBtn.style.display = "none";
});

saveEditOutputBtn.addEventListener("click", ()=>{
  const updated = outputTextEditEl.value;
  window.__lastOutput = updated;
  if(window.__lastType === "html"){
    const match = updated.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    window.__lastHtmlCode = match ? match[0] : updated;
    const previewFrame = document.getElementById("previewFrame");
    if(previewFrame) previewFrame.srcdoc = window.__lastHtmlCode;
  }
  outputTextEl.textContent = updated;
  updateTokenCount(updated);

  const mathEl = document.getElementById("mathPreview");
  if(mathEl && mathEl.style.display !== "none"){
    mathEl.innerHTML = escapeHtml(updated).replace(/\n/g, "<br>");
    if(window.MathJax && window.MathJax.typesetPromise){
      window.MathJax.typesetPromise([mathEl]).catch(err=>console.error(err));
    }
  }

  // Cập nhật lại giao diện trực quan nếu công cụ hiện tại hỗ trợ visual preview
  if(currentTool && currentTool.visualType){
    let parsedData = updated;
    if(currentTool.outputType === "json"){
      parsedData = safeParseJsonWithLatex(updated);
    }
    const formVals = window.__lastFormValues || (typeof formValuesCache !== 'undefined' && formValuesCache[currentTool.id]) || {};
    renderUniversalVisualView(currentTool.id, parsedData, formVals, false);
  }

  outputTextEditEl.style.display = "none";
  outputTextEl.style.display = "block";
  editOutputBtn.style.display = "inline-flex";
  saveEditOutputBtn.style.display = "none";
  cancelEditOutputBtn.style.display = "none";

  const status = document.getElementById("genStatus");
  if(status){
    status.className = "status ok";
    status.textContent = "✓ Đã lưu nội dung prompt vừa sửa!";
    setTimeout(()=> { if(status.textContent.includes("vừa sửa")) status.textContent = ""; }, 2500);
  }
});

document.getElementById("downloadBtn").addEventListener("click", ()=>{
  if(!window.__lastOutput) return;
  const mimeType = (window.__lastType === "html") ? "text/html;charset=utf-8" :
                   (window.__lastType === "json") ? "application/json;charset=utf-8" : "text/plain;charset=utf-8";
  const blob = new Blob([window.__lastOutput], {type: mimeType});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = window.__lastFilename || "prompt.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("docBtn").addEventListener("click", ()=>{
  if(!window.__lastOutput) return;
  const baseName = (window.__lastFilename || "prompt").replace(/\.[^/.]+$/, "");
  const filename = baseName + ".doc";
  let content = "";

  // Kiểm tra nếu là dữ liệu JSON Infographic 3 cột (toan-thuc-te hoặc tương tự)
  let isJsonObj = false;
  let parsed = null;
  try {
    parsed = JSON.parse(window.__lastOutput);
    if(parsed && typeof parsed === "object") isJsonObj = true;
  } catch(e){}

  if(isJsonObj && (parsed.frames || parsed.items || parsed.pages)){
    const docTitle = parsed.title || "BÀI TẬP TOÁN THỰC TẾ";
    const subTitle = `${parsed.subject || "Toán"} | Bộ sách: ${parsed.curriculum || "Kết nối tri thức với cuộc sống"} | Phong cách: ${parsed.style || "Sketchnote mực xanh"}`;
    
    let items = [];
    if(Array.isArray(parsed.frames)) items = parsed.frames;
    else if(Array.isArray(parsed.pages)) parsed.pages.forEach(p => { if(Array.isArray(p.items)) items = items.concat(p.items); });
    else if(Array.isArray(parsed.items)) items = parsed.items;

    let rowsHtml = items.map((it, idx) => {
      const qNum = it.frame_num || it.question_num || (idx + 1);
      const prob = (it.col1_problem || it.problem || "").replace(/\n/g, "<br>");
      
      let illuText = "";
      if(it.col2_illustration && typeof it.col2_illustration === "object"){
        const tikz = it.col2_illustration.math_layer_tikz || "";
        const art = it.col2_illustration.art_layer_image_prompt || "";
        illuText = `<b style="color:#1d4ed8;">[Math Layer - Mã TikZ]:</b><br><pre style="font-family:'Courier New',monospace;font-size:9pt;background:#f8fafc;padding:6px;border:1px solid #cbd5e1;">${tikz.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre><br><b style="color:#0369a1;">[Art Layer - Gợi ý tạo ảnh]:</b><br><i style="color:#0369a1;">${art.replace(/\n/g, "<br>")}</i>`;
      } else {
        illuText = (it.col2_illustration || it.col2_tikz_illustration || it.illustration || "").replace(/\n/g, "<br>");
      }

      const sol = it.col3_teacher_solution || it.col3_solution || it.solution || "";
      const ruled = it.col3_ruled_lines || it.col3_student_blank_lines || "";
      const col3Content = sol ? `<b style="color:#15803d;">Lời giải chi tiết & Đáp số:</b><br>${sol.replace(/\n/g, "<br>")}` :
        `<b style="color:#1e40af;">Khung bài làm học sinh:</b><br><div style="line-height:2.2;color:#1e40af;font-family:'Times New Roman',serif;">${(ruled || "........................................................................................<br>........................................................................................<br>........................................................................................<br>........................................................................................<br><b>Đáp số:</b> ....................").replace(/\n/g, "<br>")}</div>`;

      return `
        <tr style="page-break-inside:avoid;">
          <td style="width:36%;vertical-align:top;padding:10px;border:1px solid #94a3b8;background:#f8fafc;">
            <b style="color:#1e3a8a;font-size:11.5pt;">Câu ${qNum}${it.level ? ' (' + it.level + ')' : ''}</b><br>
            ${it.title ? '<i style="color:#475569;">' + it.title + '</i><br>' : ''}
            <div style="margin-top:6px;line-height:1.6;">${prob}</div>
          </td>
          <td style="width:32%;vertical-align:top;padding:10px;border:1px solid #94a3b8;background:#f0f7ff;">
            <b style="color:#0369a1;font-size:11pt;">Hình minh họa (TikZ / Art Lock)</b><br>
            <div style="margin-top:6px;line-height:1.5;font-size:10pt;">${illuText}</div>
          </td>
          <td style="width:32%;vertical-align:top;padding:10px;border:1px solid #94a3b8;background:#ffffff;">
            ${col3Content}
          </td>
        </tr>
      `;
    }).join("");

    content = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${baseName}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 20px; }
  h1 { font-family: 'Times New Roman', serif; text-align: center; color: #1e3a8a; font-size: 18pt; margin-bottom: 4px; text-transform: uppercase; }
  .subtitle { text-align: center; color: #475569; font-size: 11pt; margin-bottom: 18px; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th { background-color: #2563eb; color: #ffffff; padding: 10px; border: 1px solid #1d4ed8; text-align: center; font-size: 11pt; }
  pre { font-family: 'Courier New', monospace; font-size: 9pt; white-space: pre-wrap; word-wrap: break-word; }
</style>
</head>
<body>
  <h1>${docTitle}</h1>
  <div class="subtitle">${subTitle}</div>
  <table>
    <thead>
      <tr>
        <th style="width:36%;">CỘT 1: ĐỀ BÀI TOÁN THỰC TẾ</th>
        <th style="width:32%;">CỘT 2: HÌNH MINH HỌA (MATH & ART)</th>
        <th style="width:32%;">CỘT 3: BÀI LÀM / LỜI GIẢI</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;
  } else {
    // Định dạng văn bản Markdown chuẩn Word
    const formattedBody = window.__lastOutput
      .replace(/^### (.*$)/gim, '<h3 style="color:#1e3a8a;margin-top:16px;margin-bottom:6px;font-size:13pt;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#1e3a8a;text-align:center;text-transform:uppercase;margin-top:20px;margin-bottom:8px;font-size:16pt;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*?)\*/gim, '<i>$1</i>')
      .replace(/\n/g, "<br>");

    content = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${baseName}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; margin: 24px; }
  pre { font-family: 'Courier New', monospace; font-size: 10pt; background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; white-space: pre-wrap; word-wrap: break-word; }
</style>
</head>
<body>
${formattedBody}
</body>
</html>`;
  }

  const blob = new Blob(['\ufeff' + content], {type: 'application/msword;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("beautifyBtn").addEventListener("click", ()=>{
  if(!window.__lastOutput) return;
  try {
    const parsed = JSON.parse(window.__lastOutput);
    const pretty = JSON.stringify(parsed, null, 2);
    window.__lastOutput = pretty;
    document.getElementById("outputText").textContent = pretty;
    updateTokenCount(pretty);
  } catch(err){
    alert("Nội dung không phải cú pháp JSON hợp lệ.");
  }
});

/* --- THEME SYSTEM --- */
function applyTheme(themeId){
  const theme = themeId || localStorage.getItem("APP_THEME") || "ocean-blue";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("APP_THEME", theme);
  ["themeSelect", "sidebarThemeSelect", "headerThemeSelect"].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = theme;
  });
}

document.addEventListener("change", (e)=>{
  if(e.target && (e.target.id === "sidebarThemeSelect" || e.target.id === "headerThemeSelect" || e.target.id === "themeSelect")){
    applyTheme(e.target.value);
  }
});

/* --- MODAL SETTINGS LISTENERS --- */
const settingsBtn = document.getElementById("settingsBtn");
if(settingsBtn){
  settingsBtn.addEventListener("click", ()=>{
    const settingsModal = document.getElementById("settingsModal");
    if(settingsModal) settingsModal.style.display = "flex";
    const apiModelSelect = document.getElementById("apiModelSelect");
    if(apiModelSelect) apiModelSelect.value = getLocalModel();
    const apiKeyInput = document.getElementById("apiKeyInput");
    const currentKey = getLocalApiKey();
    if(apiKeyInput && currentKey) apiKeyInput.value = currentKey;
    applyTheme();
    
    const apiKeyStatus = document.getElementById("apiKeyStatus");
    if(apiKeyStatus){
      if(isGasEnv()){
        apiKeyStatus.textContent = "Đang kiểm tra kết nối máy chủ...";
        google.script.run.withSuccessHandler(has=>{
          apiKeyStatus.textContent = has
            ? "✓ Đã lưu API key trên máy chủ Apps Script. Nhập key mới nếu muốn thay thế."
            : "Chưa có API key trên máy chủ.";
        }).hasApiKey();
      } else {
        apiKeyStatus.textContent = currentKey 
          ? "✓ Đã lưu API key trên trình duyệt (" + currentKey.slice(0, 6) + "..." + currentKey.slice(-4) + ")."
          : "Chưa có API key nào được lưu trên trình duyệt.";
      }
    }
  });
}

const apiKeyToggle = document.getElementById("apiKeyToggle");
if(apiKeyToggle){
  apiKeyToggle.addEventListener("click", ()=>{
    const apiKeyInput = document.getElementById("apiKeyInput");
    if(apiKeyInput){
      const isPw = apiKeyInput.type === "password";
      apiKeyInput.type = isPw ? "text" : "password";
      apiKeyToggle.textContent = isPw ? "🙈" : "👁";
    }
  });
}

const settingsCloseBtn = document.getElementById("settingsCloseBtn");
if(settingsCloseBtn){
  settingsCloseBtn.addEventListener("click", ()=>{
    const settingsModal = document.getElementById("settingsModal");
    if(settingsModal) settingsModal.style.display = "none";
  });
}

const settingsSaveBtn = document.getElementById("settingsSaveBtn");
if(settingsSaveBtn){
  settingsSaveBtn.addEventListener("click", ()=>{
    const settingsModal = document.getElementById("settingsModal");
    const apiKeyInput = document.getElementById("apiKeyInput");
    const apiModelSelect = document.getElementById("apiModelSelect");
    const apiKeyStatus = document.getElementById("apiKeyStatus");
    const key = apiKeyInput ? apiKeyInput.value.trim() : "";
    const chosenModel = apiModelSelect ? apiModelSelect.value : "gemini-2.5-flash";
    setLocalModel(chosenModel);

    const chosenTheme = document.getElementById("themeSelect") ? document.getElementById("themeSelect").value : "ocean-blue";
    applyTheme(chosenTheme);
    
    if(!key){
      if(apiKeyStatus) apiKeyStatus.textContent = "✓ Đã cập nhật mô hình & theme!";
      setTimeout(()=> { if(settingsModal) settingsModal.style.display = "none"; }, 800);
      return;
    }

    setLocalApiKey(key);
    if(apiKeyStatus) apiKeyStatus.textContent = "Đang lưu cấu hình...";
    
    if(isGasEnv()){
      google.script.run
        .withSuccessHandler(()=>{
          if(apiKeyStatus) apiKeyStatus.textContent = "✓ Đã lưu API key & cấu hình thành công.";
          if(apiKeyInput) apiKeyInput.value = "";
          hideApiKeyBanner();
          setTimeout(()=> { if(settingsModal) settingsModal.style.display = "none"; }, 1000);
        })
        .withFailureHandler(err=>{
          if(apiKeyStatus) apiKeyStatus.textContent = "Lỗi lưu key: " + (err.message||err);
        })
        .saveApiKey(key);
    } else {
      if(apiKeyStatus) apiKeyStatus.textContent = "✓ Đã lưu cấu hình thành công trên trình duyệt.";
      if(apiKeyInput) apiKeyInput.value = "";
      hideApiKeyBanner();
      setTimeout(()=> { if(settingsModal) settingsModal.style.display = "none"; }, 1000);
    }
  });
}

/* --- HISTORY MODAL LISTENERS --- */
const historyBtn = document.getElementById("historyBtn");
if(historyBtn){
  historyBtn.addEventListener("click", ()=>{
    const historyModal = document.getElementById("historyModal");
    if(historyModal) historyModal.style.display = "flex";
    const historyList = document.getElementById("historyList");
    if(historyList) historyList.innerHTML = "Đang tải lịch sử...";

    if(isGasEnv()){
      google.script.run
        .withSuccessHandler(rows=>renderHistoryRows(rows))
        .withFailureHandler(err=>renderLocalHistory())
        .getHistory(25);
    } else {
      renderLocalHistory();
    }
  });
}

const clearHistoryBtn = document.getElementById("clearHistoryBtn");
if(clearHistoryBtn){
  clearHistoryBtn.addEventListener("click", ()=>{
    if(confirm("Bạn có chắc muốn xoá lịch sử đã lưu trên trình duyệt?")){
      localStorage.removeItem("GEMINI_PROMPT_HISTORY");
      renderLocalHistory();
    }
  });
}

const historyCloseBtn = document.getElementById("historyCloseBtn");
if(historyCloseBtn){
  historyCloseBtn.addEventListener("click", ()=>{
    const historyModal = document.getElementById("historyModal");
    if(historyModal) historyModal.style.display = "none";
  });
}

/* --- GUIDE MODAL LISTENERS --- */
const toolGuideBtn = document.getElementById("toolGuideBtn");
if(toolGuideBtn){
  toolGuideBtn.addEventListener("click", ()=>{
    const guideModal = document.getElementById("guideModal");
    const guideModalTitle = document.getElementById("guideModalTitle");
    const guideModalBody = document.getElementById("guideModalBody");
    const guideContent = GUIDES[currentTool.id] || "<p>Chưa có hướng dẫn cho công cụ này.</p>";
    if(guideModalTitle) guideModalTitle.textContent = "📘 Hướng dẫn chi tiết: " + currentTool.name;
    if(guideModalBody) guideModalBody.innerHTML = guideContent;
    if(guideModal) guideModal.style.display = "flex";
  });
}

const guideCloseBtn = document.getElementById("guideCloseBtn");
if(guideCloseBtn){
  guideCloseBtn.addEventListener("click", ()=>{
    const guideModal = document.getElementById("guideModal");
    if(guideModal) guideModal.style.display = "none";
  });
}

/* --- ARCHIVE MODAL LISTENERS --- */
const archiveModal = document.getElementById("archiveModal");
document.getElementById("saveArchiveBtn").addEventListener("click", ()=>{
  if(!window.__lastOutput) return;
  const now = new Date().toLocaleString("vi-VN");
  const toolName = currentTool ? currentTool.name : "Công cụ";
  const defaultTitle = (currentTool ? currentTool.title : "Tài liệu") + " - " + now;
  
  const userTitle = prompt("Nhập tên gợi nhớ để lưu kết quả vào kho:", defaultTitle);
  if(userTitle === null) return;
  
  const title = userTitle.trim() || defaultTitle;
  const itemType = (window.__lastType === "html") ? "HTML" :
                   (window.__lastType === "json") ? "JSON" :
                   (window.__lastFilename && window.__lastFilename.endsWith(".doc")) ? "DOC" : "PROMPT";

  const newItem = {
    id: Date.now(),
    title: title,
    toolId: currentTool ? currentTool.id : "custom",
    toolName: toolName,
    time: now,
    type: itemType,
    filename: window.__lastFilename || "file.txt",
    content: window.__lastOutput
  };

  const archive = getArchiveData();
  archive.unshift(newItem);
  saveArchiveData(archive);

  if(fbDb){
    fbDb.collection("shared_archives").doc(String(newItem.id)).set(newItem).then(()=>{
      if(!cloudArchiveItems.some(i => String(i.id) === String(newItem.id))){
        cloudArchiveItems.unshift(newItem);
      }
      renderArchiveItems();
    }).catch(err => console.log("Lỗi đồng bộ Cloud:", err));
  }

  const btn = document.getElementById("saveArchiveBtn");
  const orig = btn.innerHTML;
  btn.innerHTML = "✓ Đã lưu Cloud & Máy!";
  setTimeout(()=> btn.innerHTML = orig, 2000);
});

/* --- ARCHIVE MODAL LISTENERS --- */
const archiveBtn = document.getElementById("archiveBtn");
if(archiveBtn){
  archiveBtn.addEventListener("click", ()=>{
    const archiveModal = document.getElementById("archiveModal");
    if(archiveModal) archiveModal.style.display = "flex";
    loadCloudArchives();
    renderArchiveItems();
  });
}

const archiveCloseBtn = document.getElementById("archiveCloseBtn");
if(archiveCloseBtn){
  archiveCloseBtn.addEventListener("click", ()=>{
    const archiveModal = document.getElementById("archiveModal");
    if(archiveModal) archiveModal.style.display = "none";
  });
}

/* --- SOURCES MODAL LISTENERS --- */
const sourcesBtn = document.getElementById("sourcesBtn");
if(sourcesBtn){
  sourcesBtn.addEventListener("click", ()=>{
    const sourcesModal = document.getElementById("sourcesModal");
    if(sourcesModal) sourcesModal.style.display = "flex";
    loadCloudSources();
    renderSourceItems();
  });
}

const sourcesCloseBtn = document.getElementById("sourcesCloseBtn");
if(sourcesCloseBtn){
  sourcesCloseBtn.addEventListener("click", ()=>{
    const sourcesModal = document.getElementById("sourcesModal");
    if(sourcesModal) sourcesModal.style.display = "none";
  });
}

const addSourceToggleBtn = document.getElementById("addSourceToggleBtn");
if(addSourceToggleBtn){
  addSourceToggleBtn.addEventListener("click", ()=>{
    const form = document.getElementById("addSourceForm");
    if(form) form.style.display = form.style.display === "none" ? "block" : "none";
  });
}

const cancelAddSourceBtn = document.getElementById("cancelAddSourceBtn");
if(cancelAddSourceBtn){
  cancelAddSourceBtn.addEventListener("click", ()=>{
    const form = document.getElementById("addSourceForm");
    if(form) form.style.display = "none";
  });
}

document.getElementById("saveNewSourceBtn").addEventListener("click", ()=>{
  const title = document.getElementById("newSourceTitle").value.trim();
  const type = document.getElementById("newSourceType").value;
  const content = document.getElementById("newSourceContent").value.trim();
  
  if(!title || !content){
    alert("Vui lòng nhập cả tên nguồn và nội dung dữ liệu.");
    return;
  }
  
  const newSource = {
    id: Date.now(),
    title: title,
    type: type,
    time: new Date().toLocaleString("vi-VN"),
    content: content
  };

  const sources = getSourcesData();
  sources.unshift(newSource);
  saveSourcesData(sources);

  if(fbDb){
    fbDb.collection("shared_sources").doc(String(newSource.id)).set(newSource).then(()=>{
      if(!cloudSourceItems.some(s => String(s.id) === String(newSource.id))){
        cloudSourceItems.unshift(newSource);
      }
      renderSourceItems();
    }).catch(err=>console.log(err));
  }

  document.getElementById("newSourceTitle").value = "";
  document.getElementById("newSourceContent").value = "";
  document.getElementById("addSourceForm").style.display = "none";
  renderSourceItems();
});

/* --- AUTO FILL KHO NGUỒN FORM FROM PDF / DRIVE LINK --- */
const newSourcePdfFileBtn = document.getElementById("newSourcePdfFileBtn");
const newSourcePdfFile = document.getElementById("newSourcePdfFile");
const newSourceDriveLinkBtn = document.getElementById("newSourceDriveLinkBtn");
const newSourceDriveLink = document.getElementById("newSourceDriveLink");
const newSourceExtractStatus = document.getElementById("newSourceExtractStatus");

if(newSourcePdfFileBtn && newSourcePdfFile){
  newSourcePdfFileBtn.addEventListener("click", ()=>{
    newSourcePdfFile.click();
  });

  newSourcePdfFile.addEventListener("change", async (e)=>{
    const f = e.target.files[0];
    if(!f) return;

    if(newSourceExtractStatus){
      newSourceExtractStatus.className = "status loading";
      newSourceExtractStatus.textContent = "⚡ Đang bóc tách dữ liệu từ file " + f.name + "...";
    }

    const titleInput = document.getElementById("newSourceTitle");
    if(titleInput){
      titleInput.value = f.name.replace(/\.[^/.]+$/, "");
    }

    const typeSelect = document.getElementById("newSourceType");
    if(typeSelect){
      const lower = f.name.toLowerCase();
      if(lower.includes("sgk") || lower.includes("sách")) typeSelect.value = "SGK / Giáo trình";
      else if(lower.includes("đề") || lower.includes("de") || lower.includes("thi")) typeSelect.value = "Đề thi / Bài tập";
      else typeSelect.value = "Tài liệu tham khảo";
    }

    const contentTextarea = document.getElementById("newSourceContent");

    if(f.type.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".md") || f.name.endsWith(".json") || f.name.endsWith(".tex")){
      const reader = new FileReader();
      reader.onload = function(evt){
        const txt = evt.target.result;
        if(contentTextarea) contentTextarea.value = txt;
        if(newSourceExtractStatus){
          newSourceExtractStatus.className = "status ok";
          newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự vào mẫu bên dưới!";
        }
      };
      reader.readAsText(f);
    } else if(f.name.endsWith(".docx") || f.name.endsWith(".doc")){
      if(typeof mammoth !== "undefined"){
        const reader = new FileReader();
        reader.onload = function(evt){
          mammoth.extractRawText({arrayBuffer: evt.target.result})
            .then(function(result){
              const txt = result.value;
              if(contentTextarea) contentTextarea.value = txt;
              if(newSourceExtractStatus){
                newSourceExtractStatus.className = "status ok";
                newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự từ file Word vào mẫu!";
              }
            })
            .catch(function(err){
              if(newSourceExtractStatus){
                newSourceExtractStatus.className = "status err";
                newSourceExtractStatus.textContent = "Lỗi đọc file Word: " + err.message;
              }
            });
        };
        reader.readAsArrayBuffer(f);
      }
    } else if(f.name.toLowerCase().endsWith(".pdf") || f.type === "application/pdf"){
      const tryPdfJsModal = async () => {
        if(typeof pdfjsLib !== "undefined"){
          try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const arrayBuffer = await f.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for(let i = 1; i <= pdf.numPages; i++){
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(" ");
              if(pageText.trim()){
                fullText += `--- Trang ${i} ---\n` + pageText + "\n\n";
              }
            }
            if(fullText.trim().length > 30){
              const txt = fullText.trim();
              if(contentTextarea) contentTextarea.value = txt;
              if(newSourceExtractStatus){
                newSourceExtractStatus.className = "status ok";
                newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự từ PDF (" + pdf.numPages + " trang) vào mẫu bên dưới!";
              }
              return true;
            }
          } catch(err){
            console.warn("PDF.js modal extract fallback to Gemini OCR:", err);
          }
        }
        return false;
      };

      tryPdfJsModal().then(async success => {
        if(success) return;
        try {
          const txt = await callGeminiVisionOCR(f, "Hãy trích xuất toàn bộ nội dung văn bản, lý thuyết, công thức toán và kiến thức học tập trong tài liệu PDF này một cách đầy đủ và chính xác nhất.");
          if(contentTextarea) contentTextarea.value = txt;
          if(newSourceExtractStatus){
            newSourceExtractStatus.className = "status ok";
            newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự từ PDF bằng Gemini Vision!";
          }
        } catch(err){
          if(newSourceExtractStatus){
            newSourceExtractStatus.className = "status err";
            newSourceExtractStatus.textContent = "Lỗi trích xuất: " + err.message;
          }
        }
      });
    } else {
      try {
        const txt = await callGeminiVisionOCR(f, "Hãy trích xuất toàn bộ nội dung văn bản, lý thuyết, công thức toán và kiến thức học tập trong tài liệu/hình ảnh này một cách đầy đủ và chính xác nhất.");
        if(contentTextarea) contentTextarea.value = txt;
        if(newSourceExtractStatus){
          newSourceExtractStatus.className = "status ok";
          newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự từ hình ảnh vào mẫu bên dưới!";
        }
      } catch(err){
        if(newSourceExtractStatus){
          newSourceExtractStatus.className = "status err";
          newSourceExtractStatus.textContent = "Lỗi trích xuất: " + err.message;
        }
      }
    }
  });
}

if(newSourceDriveLinkBtn && newSourceDriveLink){
  newSourceDriveLinkBtn.addEventListener("click", async ()=>{
    const url = newSourceDriveLink.value.trim();
    if(!url){
      alert("Vui lòng dán link Google Drive trước.");
      return;
    }
    if(newSourceExtractStatus){
      newSourceExtractStatus.className = "status loading";
      newSourceExtractStatus.textContent = "⚡ Đang bóc tách dữ liệu từ link Google Drive...";
    }

    const titleInput = document.getElementById("newSourceTitle");
    if(titleInput && !titleInput.value) titleInput.value = "Nguồn Google Drive";
    const typeSelect = document.getElementById("newSourceType");
    if(typeSelect) typeSelect.value = "Link Google Drive / Web";

    if(isGasEnv()){
      google.script.run
        .withSuccessHandler(txt=>{
          const contentTextarea = document.getElementById("newSourceContent");
          if(contentTextarea) contentTextarea.value = txt;
          if(newSourceExtractStatus){
            newSourceExtractStatus.className = "status ok";
            newSourceExtractStatus.textContent = "✓ Đã tự động nạp " + txt.length.toLocaleString() + " ký tự từ link Google Drive vào mẫu!";
          }
        })
        .withFailureHandler(err=>{
          if(newSourceExtractStatus){
            newSourceExtractStatus.className = "status err";
            newSourceExtractStatus.textContent = "Lỗi: " + (err.message||err);
          }
        })
        .extractFromUrl(url);
    } else {
      if(newSourceExtractStatus){
        newSourceExtractStatus.className = "status ok";
        newSourceExtractStatus.textContent = "Chế độ web: Bạn hãy mở link Google Drive và copy/paste văn bản trực tiếp vào ô bên dưới.";
      }
    }
  });
}

document.getElementById("sourcesSearchInput").addEventListener("input", renderSourceItems);

window.useSourceItem = function(id){
  const localSources = getSourcesData();
  const item = localSources.find(i => String(i.id) === String(id)) || cloudSourceItems.find(i => String(i.id) === String(id));
  if(item){
    sourceText = item.content;
    const srcTextEl = document.getElementById("srcText");
    if(srcTextEl) srcTextEl.value = sourceText;
    
    const activeNguonEl = document.getElementById("f_nguon");
    if(activeNguonEl){
      activeNguonEl.value = sourceText;
    }

    sourcesModal.style.display = "none";
    alert(`✓ Đã trích xuất & áp dụng nguồn "${item.title}" vào công cụ!`);
  }
};

window.copySourceItem = async function(id){
  const localSources = getSourcesData();
  const item = localSources.find(i => String(i.id) === String(id)) || cloudSourceItems.find(i => String(i.id) === String(id));
  if(item){
    await copyToClipboard(item.content);
    alert("✓ Đã sao chép nội dung nguồn dữ liệu!");
  }
};

window.downloadSourceItem = function(id){
  const localSources = getSourcesData();
  const item = localSources.find(i => String(i.id) === String(id)) || cloudSourceItems.find(i => String(i.id) === String(id));
  if(!item) return;
  const blob = new Blob([item.content], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${item.title}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.deleteSourceItem = function(id){
  if(confirm("Bạn có chắc muốn xóa nguồn dữ liệu này khỏi kho?")){
    let sources = getSourcesData();
    sources = sources.filter(i => String(i.id) !== String(id));
    saveSourcesData(sources);
    cloudSourceItems = cloudSourceItems.filter(i => String(i.id) !== String(id));

    if(fbDb){
      fbDb.collection("shared_sources").doc(String(id)).delete().catch(err => console.log("Lỗi xóa Cloud:", err));
    }
    renderSourceItems();
  }
};

document.getElementById("clearSourcesBtn").addEventListener("click", ()=>{
  if(confirm("Bạn có chắc muốn XÓA TOÀN BỘ KHO NGUỒN DỮ LIỆU? Thao tác này không thể hoàn tác.")){
    localStorage.removeItem("GEMINI_SAVED_SOURCES");
    cloudSourceItems = [];
    renderSourceItems();
  }
});

/* --- QUICK AUDIT BUTTON (TOOL #12) --- */
const quickAuditBtnEl = document.getElementById("quickAuditBtn");
if(quickAuditBtnEl){
  quickAuditBtnEl.addEventListener("click", ()=>{
    if(!window.__lastOutput){
      alert("Chưa có nội dung prompt nào được tạo. Vui lòng chọn một công cụ và bấm 'Tạo prompt' trước khi sử dụng tính năng kiểm tra.");
      return;
    }
    selectTool("kiem-soat-prompt");
    const promptInput = document.getElementById("f_prompt_goc");
    if(promptInput){
      promptInput.value = window.__lastOutput;
    }
    const errInput = document.getElementById("f_mo_ta_loi");
    if(errInput){
      errInput.focus();
    }
    const formArea = document.getElementById("formArea");
    if(formArea) formArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* --- COMMUNITY MODAL & QUICK LINKS LISTENERS --- */
/* --- COMMUNITY MODAL & QUICK LINKS LISTENERS --- */
const socialBtn = document.getElementById("socialBtn");
if(socialBtn){
  socialBtn.addEventListener("click", ()=>{
    const socialModal = document.getElementById("socialModal");
    if(socialModal) socialModal.style.display = "flex";
  });
}

const socialCloseBtn = document.getElementById("socialCloseBtn");
if(socialCloseBtn){
  socialCloseBtn.addEventListener("click", ()=>{
    const socialModal = document.getElementById("socialModal");
    if(socialModal) socialModal.style.display = "none";
  });
}

const giveHeartBtn = document.getElementById("giveHeartBtn");
if(giveHeartBtn){
  giveHeartBtn.addEventListener("click", async ()=>{
    heartsCount++;
    localStorage.setItem("LOCAL_HEARTS_COUNT", heartsCount);
    updateCommunityUI(visitsCount, heartsCount);

    giveHeartBtn.style.transform = "scale(1.15)";
    setTimeout(()=> giveHeartBtn.style.transform = "scale(1)", 200);

    if(fbDb){
      fbDb.collection("app_stats").doc("general").set({
        hearts: firebase.firestore.FieldValue.increment(1)
      }, { merge: true }).catch(err=>console.log(err));
    }
  });
}

const sendCommentBtn = document.getElementById("sendCommentBtn");
if(sendCommentBtn){
  sendCommentBtn.addEventListener("click", async ()=>{
    const authorInput = document.getElementById("commentAuthorInput");
    const contentInput = document.getElementById("commentContentInput");
    const statusEl = document.getElementById("commentStatus");

    const author = authorInput ? authorInput.value.trim() || (currentUser ? (currentUser.displayName || currentUser.email) : "Thầy/Cô Giáo Vô Danh") : "Thầy/Cô Giáo Vô Danh";
    const content = contentInput ? contentInput.value.trim() : "";

    if(!content){
      if(statusEl){
        statusEl.textContent = "Vui lòng nhập nội dung bình luận.";
        statusEl.style.color = "#E1523D";
      }
      return;
    }

    if(statusEl){
      statusEl.textContent = "Đang gửi...";
      statusEl.style.color = "var(--yellow)";
    }

    const newComment = {
      author: author,
      content: content,
      time: new Date().toLocaleString("vi-VN"),
      timestamp: Date.now(),
      uid: currentUser ? currentUser.uid : "anon"
    };

    if(fbDb){
      try {
        await fbDb.collection("comments").add(newComment);
        if(contentInput) contentInput.value = "";
        if(statusEl){
          statusEl.textContent = "✓ Đã đăng bình luận thành công!";
          statusEl.style.color = "#8CE99A";
          setTimeout(()=> statusEl.textContent = "", 2000);
        }
      } catch(err){
        if(statusEl){
          statusEl.textContent = "Lỗi đăng: " + err.message;
          statusEl.style.color = "#E1523D";
        }
      }
    } else {
      let localComms = [];
      try { localComms = JSON.parse(localStorage.getItem("LOCAL_COMMENTS") || "[]"); } catch(e){}
      localComms.unshift(newComment);
      localStorage.setItem("LOCAL_COMMENTS", JSON.stringify(localComms));
      if(contentInput) contentInput.value = "";
      if(statusEl){
        statusEl.textContent = "✓ Đã đăng bình luận (Local)!";
      }
      renderLocalComments();
    }
  });
}

const quickLinksBtn = document.getElementById("quickLinksBtn");
if(quickLinksBtn){
  quickLinksBtn.addEventListener("click", ()=>{
    const quickLinksModal = document.getElementById("quickLinksModal");
    if(quickLinksModal) quickLinksModal.style.display = "flex";
  });
}

const quickLinksCloseBtn = document.getElementById("quickLinksCloseBtn");
if(quickLinksCloseBtn){
  quickLinksCloseBtn.addEventListener("click", ()=>{
    const quickLinksModal = document.getElementById("quickLinksModal");
    if(quickLinksModal) quickLinksModal.style.display = "none";
  });
}

/* --- SAVED LINKS MANAGEMENT MODAL LISTENERS --- */
const savedLinksManageModal = document.getElementById("savedLinksManageModal");
const savedLinksManageCloseBtn = document.getElementById("savedLinksManageCloseBtn");
const saveQuickLinkBtn = document.getElementById("saveQuickLinkBtn");

if(savedLinksManageCloseBtn){
  savedLinksManageCloseBtn.addEventListener("click", ()=>{
    savedLinksManageModal.style.display = "none";
  });
}

if(saveQuickLinkBtn){
  saveQuickLinkBtn.addEventListener("click", ()=>{
    const title = document.getElementById("newQuickLinkTitle").value.trim();
    const url = document.getElementById("newQuickLinkUrl").value.trim();
    if(!title || !url){
      alert("Vui lòng nhập đầy đủ Tên gợi nhớ và Đường link URL.");
      return;
    }
    const newLink = {
      id: Date.now(),
      title: title,
      url: url,
      time: new Date().toLocaleString("vi-VN")
    };
    const links = getSavedLinksData();
    links.unshift(newLink);
    saveSavedLinksData(links);

    if(fbDb){
      fbDb.collection("shared_saved_links").doc(String(newLink.id)).set(newLink).then(()=>{
        if(!cloudSavedLinksItems.some(l => String(l.id) === String(newLink.id))){
          cloudSavedLinksItems.unshift(newLink);
        }
        renderSavedLinksDropdown();
        renderSavedLinksList();
      }).catch(err => console.log(err));
    }

    document.getElementById("newQuickLinkTitle").value = "";
    document.getElementById("newQuickLinkUrl").value = "";
    renderSavedLinksDropdown();
    renderSavedLinksList();
  });
}

function renderSavedLinksList(){
  const listEl = document.getElementById("savedLinksList");
  if(!listEl) return;
  const localLinks = getSavedLinksData();
  const map = new Map();
  localLinks.forEach(item => map.set(String(item.id), {...item, isCloud: false}));
  cloudSavedLinksItems.forEach(item => {
    map.set(String(item.id), {...item, isCloud: true});
  });
  const merged = Array.from(map.values()).sort((a, b) => b.id - a.id);

  if(!merged.length){
    listEl.innerHTML = `<p style="color:#73806a;font-style:italic;text-align:center;padding:16px 0;">Chưa có link mẫu nào được lưu. Hãy nhập ở khung trên để thêm link mới!</p>`;
    return;
  }

  listEl.innerHTML = merged.map(item => `
    <div style="background:#fff;border:1px solid #c9c0a4;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div style="overflow:hidden;">
        <strong style="color:#123832;font-size:13px;display:block;">📌 ${escapeHtml(item.title)} ${item.isCloud ? '<span style="font-size:10px;background:#002B49;color:#fff;padding:1px 4px;border-radius:3px;">Cloud</span>' : ''}</strong>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" style="font-size:11.5px;color:#5a6350;text-decoration:underline;word-break:break-all;">${escapeHtml(item.url)}</a>
      </div>
      <div style="display:flex;gap:6px;white-space:nowrap;">
        <button class="btn btn-primary btn-sm" onclick="useQuickLinkItem('${item.url}')" style="font-size:11px;padding:3px 8px;background:#4EBA74;border:none;">🎯 Dùng</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteQuickLinkItem('${item.id}')" style="color:#a83232;border-color:#e0b2b2;font-size:11px;padding:3px 8px;">🗑 Xóa</button>
      </div>
    </div>
  `).join("");
}

window.useQuickLinkItem = function(url){
  const srcLinkEl = document.getElementById("srcLink");
  if(srcLinkEl){
    srcLinkEl.value = url;
    if(savedLinksManageModal) savedLinksManageModal.style.display = "none";
    document.getElementById("srcLinkBtn").click();
  }
};

window.deleteQuickLinkItem = function(id){
  if(confirm("Bạn có chắc muốn xóa link mẫu này?")){
    let links = getSavedLinksData();
    links = links.filter(i => String(i.id) !== String(id));
    saveSavedLinksData(links);
    cloudSavedLinksItems = cloudSavedLinksItems.filter(i => String(i.id) !== String(id));

    if(fbDb){
      fbDb.collection("shared_saved_links").doc(String(id)).delete().catch(err => console.log(err));
    }
    renderSavedLinksDropdown();
    renderSavedLinksList();
  }
};

/* --- WINDOW MODAL BACKDROP & ESC LISTENERS --- */
window.addEventListener("click", e=>{
  const modalIds = ["settingsModal", "historyModal", "guideModal", "archiveModal", "sourcesModal", "socialModal", "quickLinksModal", "savedLinksManageModal"];
  modalIds.forEach(id => {
    const modal = document.getElementById(id);
    if(modal && e.target === modal){
      modal.style.display = "none";
    }
  });
});

window.addEventListener("keydown", e=>{
  if(e.key === "Escape"){
    const modalIds = ["settingsModal", "historyModal", "guideModal", "archiveModal", "sourcesModal", "socialModal", "quickLinksModal", "savedLinksManageModal"];
    modalIds.forEach(id => {
      const modal = document.getElementById(id);
      if(modal) modal.style.display = "none";
    });
  }
});

/* --- INITIALIZATION --- */
applyTheme();
selectTool(currentTool ? currentTool.id : TOOLS[0].id);
checkApiKeyOnLoad();
initFirebaseSystem();


