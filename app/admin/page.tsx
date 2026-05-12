'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [code, setCode] = useState(''); const [err, setErr] = useState(''); const r = useRouter();
  async function submit() { const res = await fetch('/api/admin/login',{method:'POST',body:JSON.stringify({code})}); if (res.ok) { localStorage.setItem('hpfc_admin','1'); r.push('/admin/tournaments'); } else setErr('Invalid code'); }
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Admin code</h1><input className="input" value={code} onChange={(e)=>setCode(e.target.value)} /><button className="btn w-full" onClick={submit}>Enter</button>{err && <p className="text-red-300">{err}</p>}</div>;
}
