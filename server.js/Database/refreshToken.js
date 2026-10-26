// ✅ Token refresh utility
// Jab bhi API call fail ho 401 se, refresh token se naya token lo

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;
  
    try {
      const res  = await fetch("http://localhost:3000/refresh-token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
  
      if (res.ok) {
        localStorage.setItem("token", data.token);
        return data.token;
      } else {
        // Refresh token bhi expire — logout karo
        localStorage.clear();
        window.location.href = "/login";
        return null;
      }
    } catch {
      localStorage.clear();
      window.location.href = "/login";
      return null;
    }
  };
  
  // ✅ Smart fetch — token expire hone pe auto refresh karta hai
  export const apiFetch = async (url, options = {}) => {
    let token = localStorage.getItem("token");
  
    const makeRequest = (t) => fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${t}`,
        "Content-Type": options.body instanceof FormData
          ? undefined
          : "application/json",
        ...(options.headers || {}),
      },
    });
  
    let res = await makeRequest(token);
  
    // 401 aaya — token refresh karo aur dobara try karo
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await makeRequest(newToken);
      }
    }
  
    return res;
  };