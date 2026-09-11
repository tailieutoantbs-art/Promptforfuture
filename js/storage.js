/* ==========================================================================
   STATE MANAGEMENT, STORAGE & FIREBASE CLOUD PERSISTENCE
   ========================================================================== */



function escapeHtml(str){
  if(str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isGasEnv(){
  return typeof google !== "undefined" && google.script && typeof google.script.run !== "undefined";
}

/* --- API KEY & MODEL MANAGEMENT --- */
function getLocalApiKey(){ return localStorage.getItem("GEMINI_API_KEY") || ""; }
function setLocalApiKey(key){ localStorage.setItem("GEMINI_API_KEY", key); }
function getLocalModel(){
  let m = localStorage.getItem("GEMINI_MODEL");
  const validModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite"];
  if(!m || !validModels.includes(m)){
    m = "gemini-2.0-flash";
    localStorage.setItem("GEMINI_MODEL", m);
  }
  return m;
}
function setLocalModel(model){ localStorage.setItem("GEMINI_MODEL", model); }

function checkApiKeyOnLoad(){
  if(isGasEnv()){
    google.script.run.withSuccessHandler(has=>{
      if(!has) showApiKeyBanner();
    }).hasApiKey();
  } else {
    if(!getLocalApiKey()){
      showApiKeyBanner();
    }
  }
}

function showApiKeyBanner(){
  const b = document.getElementById("topBannerArea");
  if(!b) return;
  b.innerHTML = `
    <div class="top-banner">
      <span>⚠ Bạn chưa lưu API key Gemini. Vui lòng cài đặt key để ứng dụng có thể tự động tạo prompt.</span>
      <button type="button" id="bannerSetKeyBtn">⚙ Cài đặt ngay</button>
    </div>`;
  document.getElementById("bannerSetKeyBtn").addEventListener("click", ()=>{
    document.getElementById("settingsBtn").click();
  });
}

function hideApiKeyBanner(){
  const b = document.getElementById("topBannerArea");
  if(b) b.innerHTML = "";
}

/* --- HISTORY SYSTEM --- */
function saveHistoryLog(toolTitle, inputJson, outputSnippet){
  const now = new Date().toLocaleString("vi-VN");
  const item = { tool: toolTitle, time: now, input: inputJson, output: outputSnippet };
  
  let localHist = [];
  try {
    localHist = JSON.parse(localStorage.getItem("GEMINI_PROMPT_HISTORY") || "[]");
  } catch(e){}
  localHist.unshift(item);
  if(localHist.length > 50) localHist.pop();
  localStorage.setItem("GEMINI_PROMPT_HISTORY", JSON.stringify(localHist));

  if(isGasEnv()){
    google.script.run.logToSheet(toolTitle, inputJson, outputSnippet);
  }
}

function renderLocalHistory(){
  let localHist = [];
  try { localHist = JSON.parse(localStorage.getItem("GEMINI_PROMPT_HISTORY") || "[]"); } catch(e){}
  renderHistoryRows(localHist);
}

function renderHistoryRows(rows){
  const historyList = document.getElementById("historyList");
  if(!historyList) return;
  if(!rows || !rows.length){
    historyList.innerHTML = "<p style='color:#5a6350;font-style:italic;margin:10px 0;'>Chưa có lịch sử tạo prompt nào.</p>";
    return;
  }
  historyList.innerHTML = rows.map((r, i)=>`
    <div style="border-bottom:1px dashed #c9c0a4;padding:10px 0;">
      <div style="font-weight:600;display:flex;justify-content:space-between;color:#20281f;">
        <span>${escapeHtml(r.tool || "Công cụ")}</span>
        <span style="font-weight:400;font-size:11.5px;color:#73806a;">${escapeHtml(r.time || "")}</span>
      </div>
      <div style="color:#5a6350;font-size:12px;margin-top:4px;word-break:break-word;">
        ${escapeHtml((r.output || "").slice(0, 180))}...
      </div>
    </div>`).join("");
}

/* --- ARCHIVE SYSTEM --- */
function getArchiveData(){
  try {
    return JSON.parse(localStorage.getItem("GEMINI_SAVED_ARCHIVE") || "[]");
  } catch(e){ return []; }
}

function saveArchiveData(data){
  localStorage.setItem("GEMINI_SAVED_ARCHIVE", JSON.stringify(data));
}



async function loadCloudArchives(){
  if(!fbDb) return;
  try {
    const snapshot = await fbDb.collection("shared_archives").orderBy("id", "desc").limit(100).get();
    cloudArchiveItems = [];
    snapshot.forEach(doc => cloudArchiveItems.push(doc.data()));
    renderArchiveItems();
  } catch(err){
    console.log("Lỗi tải Cloud archives:", err);
  }
}



function renderArchiveItems(){
  const archiveList = document.getElementById("archiveList");
  const archiveSearchInput = document.getElementById("archiveSearchInput");
  const archiveFilterType = document.getElementById("archiveFilterType");
  const archiveCountStatus = document.getElementById("archiveCountStatus");
  if(!archiveList) return;

  const localArchive = getArchiveData();
  const map = new Map();
  localArchive.forEach(item => map.set(String(item.id), {...item, isCloud: false}));
  (cloudArchiveItems || []).forEach(item => {
    map.set(String(item.id), {...item, isCloud: true});
  });
  const merged = Array.from(map.values()).sort((a, b) => b.id - a.id);

  const q = (archiveSearchInput ? archiveSearchInput.value : "").trim().toLowerCase();
  const typeFilter = archiveFilterType ? archiveFilterType.value : "ALL";

  const filtered = merged.filter(item => {
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.toolName.toLowerCase().includes(q) || (item.content && item.content.toLowerCase().includes(q));
    const matchType = (typeFilter === "ALL") || (item.type === typeFilter);
    return matchSearch && matchType;
  });

  if(archiveCountStatus){
    archiveCountStatus.innerHTML = `☁️ Đám mây Cloud: <strong>${cloudArchiveItems.length}</strong> · 💻 Máy cá nhân: <strong>${localArchive.length}</strong> (Tổng: ${filtered.length})`;
  }

  if(!filtered.length){
    archiveList.innerHTML = `<p style="color:#73806a;font-style:italic;text-align:center;padding:20px 0;">Không tìm thấy tài liệu nào trong kho lưu trữ.</p>`;
    return;
  }

  archiveList.innerHTML = filtered.map(item => {
    if(editingArchiveIds[item.id]){
      return `
        <div style="border:1px dashed #f2c14e;background:#fffef5;border-radius:8px;padding:12px 14px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
          <h4 style="margin:0 0 8px;font-size:13.5px;color:#123832;display:flex;align-items:center;gap:6px;">✏️ CHỈNH SỬA TÀI LIỆU LƯU TRỮ</h4>
          <label style="display:block;font-size:12px;font-weight:600;color:#20281f;margin-bottom:4px;">Tiêu đề tài liệu / Prompt:</label>
          <input type="text" id="editArchTitle_${item.id}" value="${escapeHtml(item.title)}" style="width:100%;padding:7px 10px;border-radius:6px;border:1px solid #c9c0a4;margin-bottom:8px;font-size:13px;box-sizing:border-box;background:#fff;">
          <label style="display:block;font-size:12px;font-weight:600;color:#20281f;margin-bottom:4px;">Loại tài liệu:</label>
          <select id="editArchType_${item.id}" style="width:100%;padding:7px 10px;border-radius:6px;border:1px solid #c9c0a4;margin-bottom:8px;font-size:13px;box-sizing:border-box;background:#fff;">
            <option value="PROMPT" ${item.type==="PROMPT"?"selected":""}>Prompt / Kịch bản</option>
            <option value="HTML" ${item.type==="HTML"?"selected":""}>Game Quiz HTML</option>
            <option value="DOC" ${item.type==="DOC"?"selected":""}>Tài liệu / Đề thi</option>
            <option value="NOTE" ${item.type==="NOTE"?"selected":""}>Ghi chú / Khác</option>
          </select>
          <label style="display:block;font-size:12px;font-weight:600;color:#20281f;margin-bottom:4px;">Nội dung chi tiết:</label>
          <textarea id="editArchContent_${item.id}" style="width:100%;height:140px;padding:7px 10px;border-radius:6px;border:1px solid #c9c0a4;margin-bottom:10px;font-size:12.5px;box-sizing:border-box;font-family:'JetBrains Mono',monospace;background:#fff;">${escapeHtml(item.content)}</textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-ghost btn-sm" onclick="cancelEditArchiveItem('${item.id}')">✖ Hủy</button>
            <button class="btn btn-primary btn-sm" onclick="saveEditArchiveItem('${item.id}')" style="background:#4EBA74;border:none;">💾 Lưu thay đổi</button>
          </div>
        </div>`;
    }

    return `
      <div style="border:1px solid ${item.isCloud ? '#b3d4fc' : '#c9c0a4'};background:${item.isCloud ? '#f4f8ff' : '#fff'};border-radius:8px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
          <div>
            <span style="background:${item.isCloud ? '#002B49' : '#e0eefd'};color:${item.isCloud ? '#fff' : '#002B49'};font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;margin-right:6px;">${item.isCloud ? '☁️ Firebase Cloud' : '💻 Máy cá nhân'} · ${escapeHtml(item.type)}</span>
            <strong style="font-size:13.5px;color:#20281f;">${escapeHtml(item.title)}</strong>
          </div>
          <span style="font-size:11px;color:#73806a;white-space:nowrap;">${escapeHtml(item.time)}</span>
        </div>
        <div style="font-size:11.5px;color:#5a6350;margin-bottom:8px;">Công cụ: ${escapeHtml(item.toolName)}</div>
        <pre style="background:#fcfbf7;border:1px solid #ede8d8;border-radius:6px;padding:8px 10px;font-size:12px;max-height:100px;overflow:hidden;margin:0 0 10px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(item.content.slice(0, 300))}${item.content.length > 300 ? "..." : ""}</pre>
        <div style="display:flex;gap:6px;justify-content:flex-end;">
          <button class="btn btn-ghost btn-sm" onclick="editArchiveItem('${item.id}')" style="color:var(--yellow);border-color:rgba(242,193,78,0.5);font-size:11.5px;padding:3px 8px;">✏️ Sửa</button>
          <button class="btn btn-ghost btn-sm" onclick="copyArchiveItem('${item.id}')" style="font-size:11.5px;padding:3px 8px;">📋 Copy</button>
          <button class="btn btn-ghost btn-sm" onclick="downloadArchiveItem('${item.id}')" style="font-size:11.5px;padding:3px 8px;">💾 Tải về</button>
          <button class="btn btn-ghost btn-sm" onclick="deleteArchiveItem('${item.id}')" style="color:#a83232;border-color:#e0b2b2;font-size:11.5px;padding:3px 8px;">🗑 Xóa</button>
        </div>
      </div>`;
  }).join("");
}

/* --- DATA SOURCES REPOSITORY SYSTEM --- */


function getSourcesData(){
  try {
    return JSON.parse(localStorage.getItem("GEMINI_SAVED_SOURCES") || "[]");
  } catch(e){ return []; }
}

function saveSourcesData(data){
  localStorage.setItem("GEMINI_SAVED_SOURCES", JSON.stringify(data));
}

async function loadCloudSources(){
  if(!fbDb) return;
  try {
    const snapshot = await fbDb.collection("shared_sources").orderBy("id", "desc").limit(100).get();
    cloudSourceItems = [];
    snapshot.forEach(doc => cloudSourceItems.push(doc.data()));
    renderSourceItems();
  } catch(err){
    console.log("Lỗi tải Cloud sources:", err);
  }
}

function renderSourceItems(){
  const sourcesList = document.getElementById("sourcesList");
  const sourcesSearchInput = document.getElementById("sourcesSearchInput");
  const sourcesCountStatus = document.getElementById("sourcesCountStatus");
  if(!sourcesList) return;

  const localSources = getSourcesData();
  const map = new Map();
  localSources.forEach(item => map.set(String(item.id), {...item, isCloud: false}));
  (cloudSourceItems || []).forEach(item => {
    map.set(String(item.id), {...item, isCloud: true});
  });
  const merged = Array.from(map.values()).sort((a, b) => b.id - a.id);

  const q = (sourcesSearchInput ? sourcesSearchInput.value : "").trim().toLowerCase();
  const filtered = merged.filter(item => {
    return !q || item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) || (item.content && item.content.toLowerCase().includes(q));
  });

  if(sourcesCountStatus){
    sourcesCountStatus.innerHTML = `☁️ Cloud: <strong>${cloudSourceItems.length}</strong> · 💻 Máy cá nhân: <strong>${localSources.length}</strong> (Tổng: ${filtered.length} nguồn)`;
  }

  if(!filtered.length){
    sourcesList.innerHTML = `<p style="color:#73806a;font-style:italic;text-align:center;padding:20px 0;">Chưa có dữ liệu nguồn nào trong kho. Bấm nút <strong>+ Thêm nguồn dữ liệu mới</strong> để bắt đầu!</p>`;
    return;
  }

  sourcesList.innerHTML = filtered.map(item => `
    <div style="border:1px solid ${item.isCloud ? '#b3d4fc' : '#c9c0a4'};background:${item.isCloud ? '#f4f8ff' : '#fff'};border-radius:8px;padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
        <div>
          <span style="background:${item.isCloud ? '#002B49' : '#e0eefd'};color:${item.isCloud ? '#fff' : '#002B49'};font-size:11px;font-weight:700;padding:2px 6px;border-radius:4px;margin-right:6px;">${item.isCloud ? '☁️ Cloud' : '💻 Local'} · ${escapeHtml(item.type)}</span>
          <strong style="font-size:13.5px;color:#20281f;">${escapeHtml(item.title)}</strong>
        </div>
        <span style="font-size:11px;color:#73806a;white-space:nowrap;">${escapeHtml(item.time)}</span>
      </div>
      <pre style="background:#fcfbf7;border:1px solid #ede8d8;border-radius:6px;padding:8px 10px;font-size:12px;max-height:110px;overflow:hidden;margin:0 0 10px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(item.content.slice(0, 350))}${item.content.length > 350 ? "..." : ""}</pre>
      <div style="display:flex;gap:6px;justify-content:flex-end;">
        <button class="btn btn-primary btn-sm" onclick="useSourceItem('${item.id}')" style="font-size:11.5px;padding:3px 10px;background:#4EBA74;border:none;">🎯 Dùng nguồn này</button>
        <button class="btn btn-ghost btn-sm" onclick="copySourceItem('${item.id}')" style="font-size:11.5px;padding:3px 8px;">📋 Copy</button>
        <button class="btn btn-ghost btn-sm" onclick="downloadSourceItem('${item.id}')" style="font-size:11.5px;padding:3px 8px;">💾 Tải về</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteSourceItem('${item.id}')" style="color:#a83232;border-color:#e0b2b2;font-size:11.5px;padding:3px 8px;">🗑 Xóa</button>
      </div>
    </div>
  `).join("");
}

/* --- FIREBASE INITIALIZATION & COMMUNITY SYSTEM --- */


function updateCommunityUI(visits, hearts){
  visitsCount = visits;
  heartsCount = hearts;
  const sidebarVisitsCount = document.getElementById("sidebarVisitsCount");
  const sidebarHeartsCount = document.getElementById("sidebarHeartsCount");
  const modalVisitsCount = document.getElementById("modalVisitsCount");
  const modalHeartsCount = document.getElementById("modalHeartsCount");
  const btnHeartCount = document.getElementById("btnHeartCount");

  if(sidebarVisitsCount) sidebarVisitsCount.textContent = visits.toLocaleString();
  if(sidebarHeartsCount) sidebarHeartsCount.textContent = hearts.toLocaleString();
  if(modalVisitsCount) modalVisitsCount.textContent = visits.toLocaleString();
  if(modalHeartsCount) modalHeartsCount.textContent = hearts.toLocaleString();
  if(btnHeartCount) btnHeartCount.textContent = hearts.toLocaleString();
}

function renderLocalComments(){
  let localComms = [];
  try { localComms = JSON.parse(localStorage.getItem("LOCAL_COMMENTS") || "[]"); } catch(e){}
  renderCommentsList(localComms);
}

function renderCommentsList(comments){
  const el = document.getElementById("commentsList");
  if(!el) return;
  if(!comments || !comments.length){
    el.innerHTML = `<p style="color:#73806a;font-style:italic;text-align:center;padding:12px 0;">Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!</p>`;
    return;
  }
  el.innerHTML = comments.map(c => `
    <div style="background:#fff;border:1px solid #c9c0a4;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <strong style="color:#123832;font-size:13px;">👤 ${escapeHtml(c.author)}</strong>
        <span style="font-size:11px;color:#73806a;">${escapeHtml(c.time || "")}</span>
      </div>
      <div style="color:#20281f;font-size:12.5px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(c.content)}</div>
    </div>
  `).join("");
}

function initCommunityStats(){
  visitsCount++;
  localStorage.setItem("LOCAL_VISITS_COUNT", visitsCount);
  updateCommunityUI(visitsCount, heartsCount);

  if(!fbDb) return;

  const statsRef = fbDb.collection("app_stats").doc("general");
  
  statsRef.set({
    visits: firebase.firestore.FieldValue.increment(1),
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(err=>console.log("Stats set err:", err));

  statsRef.onSnapshot(doc => {
    if(doc.exists){
      const d = doc.data();
      const v = d.visits || visitsCount;
      const h = d.hearts || heartsCount;
      updateCommunityUI(v, h);
    }
  });

  fbDb.collection("comments")
    .orderBy("timestamp", "desc")
    .limit(30)
    .onSnapshot(snapshot => {
      const comments = [];
      snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
      renderCommentsList(comments);
    }, err => {
      renderLocalComments();
    });
}

function initFirebaseSystem(){
  if(typeof firebase === "undefined") return;
  
  try {
    let cfg = defaultFirebaseConfig;
    const userCfgStr = localStorage.getItem("CUSTOM_FIREBASE_CONFIG");
    if(userCfgStr){
      try { cfg = JSON.parse(userCfgStr); } catch(e){}
    }
    
    if(!firebase.apps.length){
      fbApp = firebase.initializeApp(cfg);
    } else {
      fbApp = firebase.app();
    }
    try {
      fbAuth = firebase.auth();
      fbDb = firebase.firestore();

      fbAuth.onAuthStateChanged(user => {
        currentUser = user;
        if(user){
          loadCloudArchives();
          loadCloudSources();
          loadCloudSavedLinks();
        }
      });

      if(!fbAuth.currentUser){
        fbAuth.signInAnonymously().catch(err => console.log("Bg auth bypass, local mode active:", err.message));
      }
    } catch(authErr) {
      console.log("Firebase auth bypass, running in local mode:", authErr.message);
    }

    initCommunityStats();

  } catch(err){
    console.warn("Lỗi khởi tạo Firebase:", err);
  }
}

/* --- QUICK SAVED LINKS MANAGEMENT (QUẢN LÝ LINK MẪU HAY DÙNG) --- */

function getSavedLinksData(){
  try {
    return JSON.parse(localStorage.getItem("GEMINI_SAVED_QUICK_LINKS") || "[]");
  } catch(e){ return []; }
}

function saveSavedLinksData(data){
  localStorage.setItem("GEMINI_SAVED_QUICK_LINKS", JSON.stringify(data));
}

async function loadCloudSavedLinks(){
  if(!fbDb) return;
  try {
    const snapshot = await fbDb.collection("shared_saved_links").orderBy("id", "desc").limit(100).get();
    cloudSavedLinksItems = [];
    snapshot.forEach(doc => cloudSavedLinksItems.push(doc.data()));
    renderSavedLinksDropdown();
  } catch(err){
    console.log("Lỗi tải Cloud saved links:", err);
  }
}

function renderSavedLinksDropdown(){
  const dropdown = document.getElementById("srcQuickLinkSelect");
  if(!dropdown) return;
  
  const localLinks = getSavedLinksData();
  const map = new Map();
  localLinks.forEach(item => map.set(String(item.id), {...item, isCloud: false}));
  (cloudSavedLinksItems || []).forEach(item => {
    map.set(String(item.id), {...item, isCloud: true});
  });
  const merged = Array.from(map.values()).sort((a, b) => b.id - a.id);

  if(!merged.length){
    dropdown.innerHTML = `<option value="">🔗 Chọn nhanh link thường dùng (Chưa có link nào đã lưu)...</option>`;
    return;
  }

  dropdown.innerHTML = `<option value="">🔗 Chọn nhanh link thường dùng (${merged.length} link đã lưu)...</option>` +
    merged.map(link => `<option value="${escapeHtml(link.url)}">📌 ${escapeHtml(link.title)} ${link.isCloud ? '(Cloud)' : ''}</option>`).join("");
}

function renderSavedLinksList(){
  const container = document.getElementById("savedLinksList");
  if(!container) return;
  const localLinks = getSavedLinksData();
  const map = new Map();
  localLinks.forEach(item => map.set(String(item.id), {...item, isCloud: false}));
  (cloudSavedLinksItems || []).forEach(item => {
    map.set(String(item.id), {...item, isCloud: true});
  });
  const merged = Array.from(map.values()).sort((a, b) => b.id - a.id);

  if(!merged.length){
    container.innerHTML = `<p style="font-size:12px;color:#73806a;font-style:italic;">Chưa có link thường dùng nào được lưu.</p>`;
    return;
  }

  container.innerHTML = merged.map(item => `
    <div style="background:#fff;border:1px solid #c9c0a4;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div style="overflow:hidden;">
        <div style="font-weight:600;color:#123832;font-size:13px;">${escapeHtml(item.title)} ${item.isCloud ? '<span style="font-size:10.5px;background:#e0eefd;color:#002B49;padding:2px 6px;border-radius:4px;margin-left:4px;">Cloud</span>' : ''}</div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" style="font-size:12px;color:#0284C7;text-decoration:none;word-break:break-all;">${escapeHtml(item.url)}</a>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn btn-primary btn-sm" type="button" style="font-size:11.5px;padding:4px 10px;" onclick="useQuickLinkItem('${escapeHtml(item.url)}')">Dùng</button>
        <button class="btn btn-ghost btn-sm" type="button" style="font-size:11.5px;padding:4px 10px;color:#a83232;border-color:rgba(168,50,50,0.4);" onclick="deleteQuickLinkItem('${item.id}')">Xóa</button>
      </div>
    </div>
  `).join("");
}

