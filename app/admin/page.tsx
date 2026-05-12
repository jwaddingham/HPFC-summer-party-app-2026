'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { pendoTrack } from '@/lib/pendo';

export default function AdminLogin() {
  const [code, setCode] = useState(''); const [err, setErr] = useState(''); const r = useRouter();
  const attemptCount = useRef(0);
  async function submit() {
    attemptCount.current++;
    const res = await fetch('/api/admin/login',{method:'POST',body:JSON.stringify({code})});
    if (res.ok) {
      localStorage.setItem('hpfc_admin','1');
      pendoTrack('admin_login_completed', {
        success: true,
        attempt_count: attemptCount.current,
      });
      r.push('/admin/tournaments');
    } else {
      pendoTrack('admin_login_failed', {
        failure_reason: 'invalid_code',
        attempt_count: attemptCount.current,
      });
      setErr('Invalid code');
    }
  }
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Admin code</h1><input className="input" value={code} onChange={(e)=>setCode(e.target.value)} /><button className="btn w-full" onClick={submit}>Enter</button>{err && <p className="text-red-300">{err}</p>}</div>;
}
