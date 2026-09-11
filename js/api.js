/* ==========================================================================
   GEMINI API & FILE EXTRACTION ENGINE
   ========================================================================== */

function getMimeType(file){
  if(!file) return "application/pdf";
  if(file.type) return file.type;
  const name = (file.name || "").toLowerCase();
  if(name.endsWith('.pdf')) return 'application/pdf';
  if(name.endsWith('.png')) return 'image/png';
  if(name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if(name.endsWith('.webp')) return 'image/webp';
  if(name.endsWith('.gif')) return 'image/gif';
  return 'application/pdf';
}

async function callGeminiDirectly(systemPrompt, userPrompt, onProgress){
  const apiKey = getLocalApiKey();
  if(!apiKey){
    throw new Error("Chưa có API key Gemini. Vui lòng bấm '⚙ Cài đặt API key' để nhập key.");
  }
  
  let model = getLocalModel();
  const validModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite"];
  if(!validModels.includes(model)){
    model = "gemini-2.0-flash";
    setLocalModel(model);
  }

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  onProgress && onProgress("Đang kết nối với Gemini (" + model + ")...");
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  };

  if(systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim()){
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch(netErr){
    throw new Error("Lỗi kết nối mạng: " + netErr.message);
  }

  let data = await res.json().catch(()=>({}));

  // Auto fallback nếu model cũ bị ngưng hỗ trợ hoặc 404
  if(!res.ok && (res.status === 404 || (data.error && (data.error.message.includes("no longer available") || data.error.message.includes("not found"))))){
    console.warn(`Model ${model} không còn khả dụng, tự động chuyển sang gemini-2.0-flash...`);
    model = "gemini-2.0-flash";
    setLocalModel(model);
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json().catch(()=>({}));
    } catch(err){}
  }

  if(!res.ok || data.error){
    const errMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
    if(res.status === 400 || res.status === 403){
      throw new Error(`API key không hợp lệ hoặc không có quyền: ${errMsg}`);
    } else if(res.status === 429){
      throw new Error(`Đã vượt quá hạn mức gọi API (Quota Exceeded): ${errMsg}`);
    } else {
      throw new Error(`Lỗi từ Gemini (${model}): ${errMsg}`);
    }
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text){
    throw new Error("Không nhận được nội dung phản hồi từ AI.");
  }
  return text;
}

// Hàm trích xuất OCR Multimodal chuyên dụng với khả năng tự khắc phục model cũ
async function callGeminiVisionOCR(file, promptText){
  const apiKey = getLocalApiKey();
  if(!apiKey){
    throw new Error("Vui lòng dán API key Gemini vào phần '⚙ Cài đặt API key' để trích xuất hình ảnh/PDF.");
  }

  let model = getLocalModel();
  const validModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite"];
  if(!validModels.includes(model)){
    model = "gemini-2.0-flash";
    setLocalModel(model);
  }

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (err) => reject(new Error("Lỗi đọc file: " + err.message));
    reader.readAsDataURL(file);
  });

  const payload = {
    contents: [{
      parts: [
        { inlineData: { mimeType: getMimeType(file), data: base64 } },
        { text: promptText || "Hãy trích xuất toàn bộ nội dung văn bản, lý thuyết, công thức toán và kiến thức học tập trong tài liệu này một cách đầy đủ và chính xác nhất." }
      ]
    }]
  };

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch(netErr){
    throw new Error("Lỗi kết nối mạng: " + netErr.message);
  }

  let data = await res.json().catch(()=>({}));

  // Auto fallback nếu model cũ bị ngưng hỗ trợ hoặc 404
  if(!res.ok && (res.status === 404 || (data.error && (data.error.message.includes("no longer available") || data.error.message.includes("not found"))))){
    console.warn(`Model ${model} không khả dụng cho OCR, tự động chuyển sang gemini-2.0-flash...`);
    model = "gemini-2.0-flash";
    setLocalModel(model);
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json().catch(()=>({}));
    } catch(err){}
  }

  // Backup fallback sang gemini-1.5-flash nếu 2.0 bận
  if(!res.ok && (res.status === 404 || (data.error && data.error.message.includes("not found")))){
    model = "gemini-1.5-flash";
    setLocalModel(model);
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await res.json().catch(()=>({}));
    } catch(err){}
  }

  if(!res.ok || data.error){
    const errMsg = data.error?.message || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`Lỗi trích xuất Gemini (${model}): ${errMsg}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text){
    throw new Error("Không nhận được nội dung trích xuất từ Gemini OCR.");
  }
  return text;
}

// Cầu nối linh hoạt giữa Apps Script (nếu có) và Direct Fetch
async function generatePromptContent(systemPrompt, userPrompt, onProgress){
  if(isGasEnv()){
    return new Promise((resolve, reject)=>{
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(err=>reject(new Error(err.message||String(err))))
        .generateContent(systemPrompt, userPrompt);
    });
  } else {
    return await callGeminiDirectly(systemPrompt, userPrompt, onProgress);
  }
}
