import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const t = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${t}] ${msg}`]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    log('▶️ Login clicked');
    log(`Payload: { email: "${username}", password: "****" }`);

    const url = 'https://bff.xerpium.com/api/auth/login';
    log(`URL: POST ${url}`);

    // First, do a raw fetch for full debug logging
    log('⏳ Sending request...');
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, password }),
      });
      log(`📡 Response: HTTP ${res.status} ${res.statusText}`);

      // Log response headers (important ones)
      const ct = res.headers.get('content-type');
      log(`   Content-Type: ${ct}`);

      // Read response body
      const bodyText = await res.text();
      if (bodyText) {
        try {
          const json = JSON.parse(bodyText);
          log(`   Body: ${JSON.stringify(json, null, 2)}`);
        } catch {
          log(`   Body: ${bodyText.substring(0, 200)}`);
        }
      }

      if (!res.ok) {
        const errData = bodyText ? JSON.parse(bodyText) : {};
        const errMsg = errData.error || `HTTP ${res.status}`;
        log(`❌ Error: ${errMsg}`);
        setError(errMsg);
        return;
      }

      // Response OK — now call context login for state management
      log('✅ Raw fetch succeeded! Calling AuthContext.login()...');
      await login(username, password);
      log('✅ Login complete!');
      // ProtectedRoute will handle redirect automatically
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login gagal';
      log(`❌ Fetch failed: ${msg}`);
      setError(msg);
    }
  };

  if (showSignup) {
    return (
      <SignupPage
        onBackToLogin={() => setShowSignup(false)}
      />
    );
  }

  // Responsive check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--paper)', 
      padding: isMobile ? '16px 12px' : '20px',
      fontFamily: "'Fraunces', serif"
    }}>
      <div style={{
        background: 'var(--paper)', borderRadius: isMobile ? '16px' : '24px', 
        padding: isMobile ? '24px 20px' : '40px 32px',
        maxWidth: 400, width: '100%', boxShadow: '0 20px 50px rgba(13,59,46,0.12)'
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--leaf-deep)',
            color: 'var(--paper)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 28, margin: '0 auto 16px'
          }}>⬢</div>
          <h1 style={{ fontSize: 28, margin: '0 0 4px', color: 'var(--ink)', fontWeight: 600 }}>KLH Admin</h1>
          <p style={{ fontSize: 13, color: 'var(--bark-soft)', margin: 0 }}>
            Dashboard Pengelola Chatbot KLH
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee', border: '1px solid #fcc', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c33'
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--bark-soft)',
              marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace"
            }}>Username (Email)</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="staff@klh.ponpes.id"
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid var(--clay)',
                borderRadius: 12, fontSize: 14, background: 'var(--paper)',
                color: 'var(--ink)', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--bark-soft)',
              marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace"
            }}>Password</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid var(--clay)',
                borderRadius: 12, fontSize: 14, background: 'var(--paper)',
                color: 'var(--ink)', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#aaa' : 'var(--leaf-deep)',
              color: 'var(--paper)', border: 'none', borderRadius: 12, fontSize: 15,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Fraunces', serif"
            }}
          >
            {loading ? '⏳ Memproses...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--bark-soft)' }}>
          Belum punya akun?{' '}
          <span onClick={() => setShowSignup(true)}
            style={{ color: 'var(--leaf-deep)', cursor: 'pointer', fontWeight: 600 }}>
            Daftar
          </span>
        </p>

        {/* DEBUG PANEL */}
        <details style={{ marginTop: 16, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          <summary style={{ cursor: 'pointer', color: 'var(--bark-soft)' }}>
            🐞 Debug ({debugLogs.length} log)
          </summary>
          <div style={{
            marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 8,
            maxHeight: 200, overflowY: 'auto'
          }}>
            {debugLogs.length === 0 && <div style={{ color: '#999' }}>Belum ada log. Coba login.</div>}
            {debugLogs.map((log, i) => (
              <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #eee', color: '#333' }}>
                {log}
              </div>
            ))}
          </div>
        </details>

      </div>
    </div>
  );
}

function SignupPage({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { signup, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [validations, setValidations] = useState({ username: '', password: '' })

  const handleValidation = () => {
    const newValidations = { username: '', password: '' }

    if (username.length > 0 && username.length < 3) {
      newValidations.username = 'Minimal 3 karakter'
    }
    if (password.length > 0 && password.length < 6) {
      newValidations.password = 'Minimal 6 karakter'
    }

    setValidations(newValidations)
    return newValidations.username === '' && newValidations.password === ''
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!handleValidation()) return

    try {
      await signup(username, password, displayName)
      // Signup successful - ProtectedRoute will handle redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup gagal')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: '20px' }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'white', border: '1.5px solid var(--ink)', padding: '40px 32px', boxShadow: '0 20px 50px rgba(13,59,46,0.12)' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--leaf)', marginBottom: 8 }}>⬢ KLH Admin</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, color: 'var(--leaf-deep)', letterSpacing: '-0.01em' }}>Daftar</h1>
          <p style={{ fontSize: 13, color: 'var(--bark-soft)', marginTop: 6 }}>Buat akun admin/staff baru</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ background: '#fee', border: '1px solid #fcc', padding: '12px 14px', borderRadius: 6, fontSize: 12, color: 'var(--clay)', marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={handleValidation}
              placeholder="Minimal 3 karakter"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: validations.username ? '1px solid var(--clay)' : '1px solid var(--line)',
                borderRadius: 6,
                fontFamily: 'inherit',
              }}
              required
            />
            {validations.username && <p style={{ fontSize: 11, color: 'var(--clay)', marginTop: 4 }}>{validations.username}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Nama Tampilan</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Siti Rahmawati"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--line)',
                borderRadius: 6,
                fontFamily: 'inherit',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handleValidation}
              placeholder="Minimal 6 karakter"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: validations.password ? '1px solid var(--clay)' : '1px solid var(--line)',
                borderRadius: 6,
                fontFamily: 'inherit',
              }}
              required
            />
            {validations.password && <p style={{ fontSize: 11, color: 'var(--clay)', marginTop: 4 }}>{validations.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--leaf-deep)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Loading...' : 'Daftar'}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <button
            onClick={onBackToLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--leaf-deep)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}
