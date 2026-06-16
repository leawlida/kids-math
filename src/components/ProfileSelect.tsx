'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

const AVATARS = ['🦁', '🐯', '🦊', '🐼', '🦄', '🐸', '🦋', '🐬', '🦅', '🐉', '⭐', '🌟']

export function ProfileSelect() {
  const profiles = useGameStore(s => s.profiles)
  const addProfile = useGameStore(s => s.addProfile)
  const setActiveProfile = useGameStore(s => s.setActiveProfile)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('🦁')

  function handleAdd() {
    if (!newName.trim()) return
    addProfile(newName.trim(), selectedAvatar)
    setShowAdd(false)
    setNewName('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-300 flex flex-col items-center justify-center p-6" dir="rtl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-8xl mb-4">🎓</div>
        <h1 className="text-5xl font-black text-white drop-shadow-lg mb-2">أكاديمية الرياضيات</h1>
        <p className="text-xl text-white/90 font-semibold">تعلم الضرب والقسمة بطريقة ممتعة!</p>
      </div>

      {/* Profiles */}
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">من يريد التعلم اليوم؟</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {profiles.map(profile => (
            <Card
              key={profile.id}
              onClick={() => setActiveProfile(profile.id)}
              className="text-center hover:ring-4 hover:ring-white"
            >
              <div className="text-5xl mb-2">{profile.avatar}</div>
              <div className="font-bold text-lg text-gray-800">{profile.name}</div>
              <div className="text-sm text-indigo-600 font-semibold">⭐ {profile.points} نقطة</div>
            </Card>
          ))}

          <Card
            onClick={() => setShowAdd(true)}
            className="text-center border-4 border-dashed border-white/50 bg-white/20 hover:bg-white/30"
          >
            <div className="text-5xl mb-2">➕</div>
            <div className="font-bold text-white">إضافة طفل</div>
          </Card>
        </div>

        {showAdd && (
          <Card className="mt-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">ملف جديد</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">الاسم</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="اكتب اسمك هنا..."
                className="w-full border-2 border-indigo-200 rounded-2xl px-4 py-3 text-lg text-right focus:outline-none focus:border-indigo-400"
                dir="rtl"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-2">اختر رمزك</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAvatar(a)}
                    className={`text-3xl p-2 rounded-xl transition-all ${selectedAvatar === a ? 'bg-indigo-100 scale-125 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="success" size="lg" onClick={handleAdd} className="flex-1">
                ابدأ التعلم! 🚀
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowAdd(false)} className="flex-1">
                إلغاء
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
