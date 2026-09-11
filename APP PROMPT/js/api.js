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
  
  const model = getLocalModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
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

  if(!res.ok){
    const errData = await res.json().catch(()=>({}));
    const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
    if(res.status === 400 || res.status === 403){
      throw new Error(`API key không hợp lệ hoặc không có quyền: ${errMsg}`);
    } else if(res.status === 429){
      throw new Error(`Đã vượt quá hạn mức gọi API (Quota Exceeded): ${errMsg}`);
    } else {
      throw new Error(`Lỗi từ Gemini (${model}): ${errMsg}`);
    }
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text){
    throw new Error("Không nhận được nội dung phản hồi từ AI.");
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
