"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
    } else {
      setError("Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}>Dexus</div>
        <div style={styles.sub}>Asset Management · Research Portal</div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoFocus
            autoComplete="current-password"
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading || !password} style={styles.btn}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f9",
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  },
  card: {
    background: "white",
    borderRadius: 10,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px 36px",
    width: 320,
    textAlign: "center",
  },
  logo: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1c3f60",
    letterSpacing: "-0.5px",
    marginBottom: 4,
  },
  sub: {
    fontSize: 11,
    color: "#8a9bb0",
    marginBottom: 28,
    fontFamily: '"IBM Plex Mono", monospace',
    letterSpacing: "0.3px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    border: "1.5px solid #dde3ea",
    borderRadius: 6,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  },
  error: {
    fontSize: 12,
    color: "#c0392b",
    textAlign: "left",
  },
  btn: {
    padding: "10px 0",
    background: "#1c3f60",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  },
};
