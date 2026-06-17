'use client'
import { useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export function Settings() {
  const setModule = useGameStore(s => s.setModule)
  const soundEnabled = useGameStore(s => s.soundEnabled)
  const toggleSound = useGameStore(s => s.toggleSound)
  const importProfiles = useGameStore(s => s.importProfiles)
  const resetActiveProgress = useGameStore(s => s.resetActiveProgress)
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function flash(type: 'ok' | 'err', text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 4000)
  }

  function handleExport() {
    const profiles = useGameStore.getState().profiles
    const data = { app: 'kids-math', version: 1, exportedAt: new Date().toISOString(), profiles }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kids-math-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    flash('ok', 'تم حفظ نسخة احتياطية 📥')
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const profiles = Array.isArray(parsed) ? parsed : parsed?.profiles
        if (!Array.isArray(profiles) || profiles.length === 0) throw new Error('no profiles')
        if (!window.confirm(`سيتم استبدال الملفات الحالية بـ ${profiles.length} ملف من النسخة الاحتياطية. متابعة؟`)) return
        importProfiles(profiles)
        flash('ok', 'تم استرجاع النسخة الاحتياطية بنجاح ✅')
      } catch {
        flash('err', 'الملف غير صالح ❌')
      } finally {
        if (fileRef.current) fileRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  function handleReset() {
    if (window.confirm('سيتم مسح كل نقاط وتقدّم الطفل الحالي نهائياً. متأكد؟')) {
      resetActiveProgress()
      flash('ok', 'تمت إعادة تعيين التقدّم 🔄')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModule('home')} className="text-indigo-600 font-bold">← رجوع</button>
          <h1 className="text-2xl font-black text-gray-800">⚙️ الإعدادات</h1>
          <span className="w-12" />
        </div>

        {msg && (
          <div className={`mb-4 rounded-2xl px-4 py-3 font-bold text-center ${msg.type === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        {/* الصوت */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-lg text-gray-800">🔊 الأصوات والقراءة</div>
              <div className="text-gray-500 text-sm">رنّات الإجابات وقراءة السؤال صوتياً</div>
            </div>
            <button
              onClick={toggleSound}
              role="switch"
              aria-checked={soundEnabled}
              className={`relative w-16 h-9 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow transition-all ${soundEnabled ? 'right-1' : 'right-8'}`} />
            </button>
          </div>
        </Card>

        {/* النسخ الاحتياطي */}
        <Card className="mb-4">
          <div className="font-black text-lg text-gray-800 mb-1">💾 النسخ الاحتياطي</div>
          <div className="text-gray-500 text-sm mb-4">
            بيانات الأطفال ونقاطهم محفوظة في هذا المتصفح فقط. احفظ نسخة احتياطية حتى لا تضيع عند مسح المتصفح.
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="lg" className="flex-1" onClick={handleExport}>
              تصدير 📥
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => fileRef.current?.click()}>
              استيراد 📤
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
        </Card>

        {/* منطقة الخطر */}
        <Card className="border-2 border-red-200">
          <div className="font-black text-lg text-red-600 mb-1">⚠️ إعادة التعيين</div>
          <div className="text-gray-500 text-sm mb-4">مسح كل نقاط وتقدّم الطفل الحالي (لا يمكن التراجع).</div>
          <Button variant="danger" size="lg" className="w-full" onClick={handleReset}>
            إعادة تعيين تقدّم الطفل الحالي
          </Button>
        </Card>
      </div>
    </div>
  )
}
