import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, BookOpen, Sparkles, Image, Trash2, Trophy } from 'lucide-react'
import { supabase } from '../supabase'
import { useAuth } from '../authContext'

const MAX_CONTENT_LENGTH = 500
const MIN_DURATION = 1
const MAX_DURATION = 1440
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function CheckinForm({ isOpen, onClose, onSuccess, activeChallenge }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleClose = useCallback(() => {
    setContent('')
    setDuration('')
    setError('')
    setShowSuccess(false)
    setImageFile(null)
    setImagePreview(null)
    onClose()
  }, [onClose])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('只支持 JPG、PNG、GIF、WebP 格式的图片')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('图片不能超过 5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    const fileName = `${user.id}/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { data, error } = await supabase.storage
      .from('checkin-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('checkin-images')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setError('请填写今天学了什么内容')
      return
    }
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      setError(`内容不能超过 ${MAX_CONTENT_LENGTH} 字`)
      return
    }

    const minutes = parseInt(duration)
    if (!duration || isNaN(minutes)) {
      setError('请填写学习时长')
      return
    }
    if (minutes < MIN_DURATION || minutes > MAX_DURATION) {
      setError(`学习时长应在 ${MIN_DURATION} 到 ${MAX_DURATION} 分钟之间`)
      return
    }

    setLoading(true)
    setUploading(true)
    try {
      // 先上传图片（如果有）
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      setUploading(false)

      // 创建打卡记录
      const { error: insertError } = await supabase.from('checkins').insert({
        user_id: user.id,
        content: trimmedContent,
        duration_minutes: minutes,
        checkin_date: new Date().toISOString().split('T')[0],
        image_url: imageUrl,
        challenge_id: activeChallenge?.id || null,
      })

      if (insertError) throw insertError

      setShowSuccess(true)
      setTimeout(() => {
        handleClose()
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message || '提交失败，请稍后再试')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm max-h-[90vh] overflow-y-auto p-6 shadow-[0_-4px_24px_rgba(255,123,123,0.15)]"
          >
            {showSuccess ? (
              <div className="flex flex-col items-center py-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                  className="text-7xl mb-4"
                >
                  🎉
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-extrabold text-[#4A3728] mb-2"
                >
                  ¡Muy bien!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[#8B7355]"
                >
                  {activeChallenge ? '挑战打卡成功！' : '打卡成功'} ✨
                </motion.p>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: (Math.random() - 0.5) * 150,
                      y: (Math.random() - 0.5) * 150,
                    }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 1.2 }}
                    className="absolute text-2xl"
                    style={{ top: '40%', left: '50%' }}
                  >
                    {['⭐', '🌟', '✨', '💫', '🌺', '📚'][i]}
                  </motion.div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-extrabold text-[#4A3728] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF7B7B]" />
                    今日打卡
                  </h2>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFF8F0] text-[#8B7355] hover:bg-[#FFE8D0] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 挑战关联提示 */}
                {activeChallenge && (
                  <div className="mb-4 flex items-center gap-2 bg-[#FFF3E0] rounded-xl px-3 py-2.5">
                    <Trophy className="w-4 h-4 text-[#FF9800]" />
                    <span className="text-sm font-semibold text-[#8B7355]">
                      正在挑战：{activeChallenge.title}
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* 学习内容 */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                      📖 今天学了什么？
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => { setContent(e.target.value); setError('') }}
                      placeholder="比如：学了不规则动词变位、背了30个新单词、练了听力..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#FFF8F0] border-2 border-transparent focus:border-[#FF7B7B] rounded-2xl text-[#4A3728] placeholder-[#C4A882] resize-none transition-all duration-200 outline-none"
                    />
                    <div className="text-right text-xs text-[#C4A882] mt-1">
                      {content.length}/{MAX_CONTENT_LENGTH}
                    </div>
                  </div>

                  {/* 学习时长 */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                      ⏱️ 学了多少分钟？
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A882] w-4 h-4" />
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => { setDuration(e.target.value); setError('') }}
                        placeholder="例如：45"
                        min={MIN_DURATION}
                        max={MAX_DURATION}
                        className="w-full pl-10 pr-16 py-3 bg-[#FFF8F0] border-2 border-transparent focus:border-[#FF7B7B] rounded-2xl text-[#4A3728] placeholder-[#C4A882] transition-all duration-200 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8B7355] font-semibold">
                        分钟
                      </span>
                    </div>
                  </div>

                  {/* 图片上传 */}
                  <div>
                    <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                      🖼️ 添加图片（可选）
                    </label>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="预览"
                          className="w-24 h-24 object-cover rounded-2xl border-2 border-[#FFE8D0]"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-3 bg-[#FFF8F0] border-2 border-dashed border-[#E8D5C4] hover:border-[#FF7B7B] rounded-2xl text-[#C4A882] hover:text-[#FF7B7B] transition-all duration-200"
                      >
                        <Image className="w-4 h-4" />
                        <span className="text-sm">点击选择图片</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  {/* 提交按钮 */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-[#FF7B7B] hover:bg-[#E85D5D] text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(255,123,123,0.35)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {uploading ? '上传中...' : '打卡'}
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
