const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const textEncoder = new TextEncoder();
const toHex = bytes => [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, "0")).join("");
const randomToken = (length = 10) => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const out = [];
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) if (byte < 256 - (256 % alphabet.length)) out.push(alphabet[byte % alphabet.length]);
  }
  return out.join("").slice(0, length);
};
const randomCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000);
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", textEncoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, textEncoder.encode(value)));
}
async function passwordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, key, 256);
  return `pbkdf2$210000$${toHex(salt)}$${toHex(bits)}`;
}
const fromHex = value => new Uint8Array((value.match(/.{2}/g) || []).map(byte => parseInt(byte, 16)));
const randomSessionToken = () => { const bytes = crypto.getRandomValues(new Uint8Array(32)); return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
async function sha256(value) { return toHex(await crypto.subtle.digest("SHA-256", textEncoder.encode(value))); }
async function verifyPassword(password, stored) { const [scheme, iterations, saltHex, expected] = String(stored || "").split("$"); if (scheme !== "pbkdf2" || Number(iterations) !== 210000 || !saltHex || !expected) return false; const key = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromHex(saltHex), iterations: 210000, hash: "SHA-256" }, key, 256); return toHex(bits) === expected; }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validPhone(value) { return /^\+[1-9]\d{7,14}$/.test(value); }
function maskDestination(value, channel) { return channel === "email" ? value.replace(/^(.{1,2})[^@]*/, "$1•••") : value.slice(0, 4) + "••••••" + value.slice(-2); }
async function sendEmail(env, to, code) {
  if (!env.RESEND_API_KEY || !env.VERIFICATION_FROM_EMAIL) throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: env.VERIFICATION_FROM_EMAIL, to: [to], subject: "Your Shujaa verification code", text: `Your Shujaa Tours and Adventures verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this message.`, html: `<p>Your Shujaa Tours and Adventures verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this message.</p>` }) });
  if (!response.ok) throw new Error("Email provider could not send the code.");
}
async function sendSms(env, to, code) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) throw new Error("SMS delivery is not configured.");
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), body = new URLSearchParams({ To: to, From: env.TWILIO_FROM_NUMBER, Body: `Your Shujaa Tours and Adventures verification code is ${code}. It expires in 10 minutes.` });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, { method: "POST", headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("SMS provider could not send the code.");
}
async function startVerification(request, env) {
  if (!env.DB || !env.CODE_PEPPER) return json({ error: "Secure verification is not configured. Please contact Shujaa Tours for help." }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: "Please check the registration details and try again." }, 400); }
  const channel = body.verificationChannel, email = String(body.email || "").trim().toLowerCase(), phone = String(body.phone || "").trim(), destination = channel === "email" ? email : phone;
  if (!['email', 'sms'].includes(channel)) return json({ error: "Choose email or SMS for verification." }, 400);
  if (!validEmail(email)) return json({ error: "Enter a valid email address." }, 400);
  if (!/^[+()\d\s-]{8,20}$/.test(phone)) return json({ error: "Enter a valid phone number." }, 400);
  if (channel === "sms" && !validPhone(phone)) return json({ error: "For SMS, enter the phone number in international format, for example +2547XXXXXXXX." }, 400);
  if (!String(body.firstName || "").trim() || !String(body.surname || "").trim() || !String(body.nationality || "").trim() || !String(body.dateOfBirth || "").trim() || !String(body.gender || "").trim() || String(body.password || "").length < 8 || body.password !== body.confirmPassword) return json({ error: "Please complete the required account details and confirm your password." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown", now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM verification_challenges WHERE created_at < ?").bind(now - 86400).run();
  const ipRate = await env.DB.prepare("SELECT COUNT(*) AS n FROM verification_challenges WHERE client_ip = ? AND created_at > ?").bind(ip, now - 3600).first();
  const destRate = await env.DB.prepare("SELECT COUNT(*) AS n FROM verification_challenges WHERE destination = ? AND created_at > ?").bind(destination, now - 3600).first();
  if ((ipRate?.n || 0) >= 10 || (destRate?.n || 0) >= 3) return json({ error: "Too many code requests. Please wait and try again later." }, 429);
  const existing = await env.DB.prepare("SELECT id FROM shujaa_users WHERE email = ? OR phone = ? LIMIT 1").bind(email, phone).first();
  if (existing) return json({ error: "An account already uses that email address or phone number. Please log in or contact us." }, 409);
  // Verify provider configuration before creating a challenge.
  if (channel === "email" && (!env.RESEND_API_KEY || !env.VERIFICATION_FROM_EMAIL)) return json({ error: "Email verification is not configured yet. Please contact Shujaa Tours." }, 503);
  if (channel === "sms" && (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER)) return json({ error: "SMS verification is not configured yet. Please contact Shujaa Tours." }, 503);
  const code = randomCode(), challengeId = crypto.randomUUID(), salt = toHex(crypto.getRandomValues(new Uint8Array(16))), codeHash = await hmac(`${salt}:${code}`, env.CODE_PEPPER);
  const profile = { firstName: String(body.firstName).trim(), middleName: String(body.middleName || "").trim(), surname: String(body.surname).trim(), gender: String(body.gender), dateOfBirth: String(body.dateOfBirth), nationality: String(body.nationality).trim(), email, phone, contactMethod: String(body.contactMethod || ""), passwordHash: await passwordHash(body.password), referralCode: String(body.referralCode || "").toUpperCase() };
  const validReferral = /^[A-HJ-NP-Z2-9]{10}$/.test(profile.referralCode) ? profile.referralCode : null;
  const data = JSON.stringify({ ...profile, referralCode: validReferral });
  await env.DB.prepare("UPDATE verification_challenges SET expires_at = 0 WHERE destination = ?").bind(destination).run();
  await env.DB.prepare("INSERT INTO verification_challenges (id, destination, channel, code_hash, salt, attempts, expires_at, data_json, client_ip, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)").bind(challengeId, destination, channel, codeHash, salt, now + 600, data, ip, now).run();
  try { if (channel === "email") await sendEmail(env, destination, code); else await sendSms(env, destination, code); }
  catch { await env.DB.prepare("DELETE FROM verification_challenges WHERE id = ?").bind(challengeId).run(); return json({ error: "We could not send your code. Check the selected contact details or try the other method." }, 502); }
  return json({ challengeId, destination: maskDestination(destination, channel), expiresIn: 600 });
}
async function verifyCode(request, env) {
  if (!env.DB || !env.CODE_PEPPER) return json({ error: "Secure verification is not configured. Please contact Shujaa Tours for help." }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: "Enter the verification code and try again." }, 400); }
  const id = String(body.challengeId || ""), code = String(body.code || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{6}$/.test(code)) return json({ error: "Enter the six-digit verification code." }, 400);
  const challenge = await env.DB.prepare("SELECT * FROM verification_challenges WHERE id = ?").bind(id).first(), now = Math.floor(Date.now() / 1000);
  if (!challenge || challenge.expires_at < now) { return json({ error: "That code has expired. Request a new one." }, 400); }
  if (challenge.attempts >= 5) return json({ error: "Too many incorrect attempts. Request a new code." }, 429);
  const expected = await hmac(`${challenge.salt}:${code}`, env.CODE_PEPPER);
  if (expected !== challenge.code_hash) { await env.DB.prepare("UPDATE verification_challenges SET attempts = attempts + 1 WHERE id = ?").bind(id).run(); return json({ error: "That code is incorrect. Please check it and try again." }, 400); }
  const p = JSON.parse(challenge.data_json), referredBy = p.referralCode ? await env.DB.prepare("SELECT referral_code FROM shujaa_users WHERE referral_code = ?").bind(p.referralCode).first() : null;
  const userId = crypto.randomUUID(), createdAt = new Date().toISOString(); let referralCode = randomToken(10);
  for (let i = 0; i < 4; i++) { try { await env.DB.prepare("INSERT INTO shujaa_users (id, first_name, middle_name, surname, gender, date_of_birth, nationality, email, phone, contact_method, verified_channel, password_hash, referral_code, referred_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(userId, p.firstName, p.middleName, p.surname, p.gender, p.dateOfBirth, p.nationality, p.email, p.phone, p.contactMethod, challenge.channel, p.passwordHash, referralCode, referredBy ? p.referralCode : null, createdAt).run(); break; } catch (e) { if (i === 3) { await env.DB.prepare("DELETE FROM verification_challenges WHERE id = ?").bind(id).run(); return json({ error: "We could not finish creating your account. The email or phone number may already be registered." }, 409); } referralCode = randomToken(10); } }
  await env.DB.prepare("DELETE FROM verification_challenges WHERE id = ?").bind(id).run();
  const token = randomSessionToken(), tokenHash = await sha256(token), sessionId = crypto.randomUUID(), expiresAt = Math.floor(Date.now() / 1000) + 604800;
  await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(sessionId, userId, tokenHash, expiresAt, createdAt).run();
  return new Response(JSON.stringify({ verified: true, referralCode, createdAt }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "set-cookie": "shujaa_session=" + token + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800" } });
}

function sessionToken(request) { return (request.headers.get("Cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith("shujaa_session="))?.slice("shujaa_session=".length) || ""; }
async function currentUser(request, env) {
  const token = sessionToken(request); if (!token || !env.DB) return null;
  const tokenHash = await sha256(token), now = Math.floor(Date.now() / 1000);
  return env.DB.prepare("SELECT u.id, u.first_name, u.referral_code FROM sessions s JOIN shujaa_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? LIMIT 1").bind(tokenHash, now).first();
}
async function login(request, env) {
  if (!env.DB) return json({ error: "Secure sign-in is not configured yet. Please contact Shujaa Tours." }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: "Enter your email or phone number and password." }, 400); }
  const identifier = String(body.identifier || "").trim(), normalizedEmail = identifier.toLowerCase(), password = String(body.password || ""), ip = request.headers.get("CF-Connecting-IP") || "unknown", now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").bind(now - 86400).run();
  const rate = await env.DB.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE (identifier = ? OR client_ip = ?) AND attempted_at > ?").bind(normalizedEmail, ip, now - 900).first();
  if ((rate?.n || 0) >= 12) return json({ error: "Too many sign-in attempts. Please wait and try again." }, 429);
  const user = await env.DB.prepare("SELECT id, password_hash, referral_code, first_name FROM shujaa_users WHERE (verified_channel = 'email' AND lower(email) = ?) OR (verified_channel = 'sms' AND phone = ?) LIMIT 1").bind(normalizedEmail, identifier).first();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await env.DB.prepare("INSERT INTO login_attempts (id, identifier, client_ip, attempted_at) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), normalizedEmail, ip, now).run();
    return json({ error: "We couldn’t sign you in with those details. Check them and try again." }, 401);
  }
  const token = randomSessionToken(), tokenHash = await sha256(token), id = crypto.randomUUID(), createdAt = new Date().toISOString(), expiresAt = now + 604800;
  await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, user.id, tokenHash, expiresAt, createdAt).run();
  return new Response(JSON.stringify({ signedIn: true, firstName: user.first_name, referralCode: user.referral_code }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "set-cookie": "shujaa_session=" + token + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800" } });
}
async function me(request, env) {
  const user = await currentUser(request, env); if (!user) return json({ signedIn: false }, 401);
  return json({ signedIn: true, firstName: user.first_name, referralCode: user.referral_code });
}
async function logout(request, env) {
  const token = sessionToken(request); if (token && env.DB) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return new Response(JSON.stringify({ signedOut: true }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "set-cookie": "shujaa_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const origin = request.headers.get("Origin"); if (request.method !== "GET" && origin && origin !== url.origin) return json({ error: "Request origin is not allowed." }, 403);
      if (url.pathname === "/api/auth/me" && request.method === "GET") return me(request, env);
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      if (url.pathname === "/api/verification/send-code") return startVerification(request, env);
      if (url.pathname === "/api/verification/verify-code") return verifyCode(request, env);
      if (url.pathname === "/api/auth/login") return login(request, env);
      if (url.pathname === "/api/auth/logout") return logout(request, env);
      return json({ error: "API route not found." }, 404);
    }
    return env.ASSETS.fetch(request);
  }
};
