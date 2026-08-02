// 荷马史诗头像 + 西语世界城市头像 — 黑绘陶瓶风格
// SVG 文件存于 public/avatars/，由组件 fetch 后内联渲染
// 这样刻线可保留真实陶土色，剪影为黑釉

export const HEROES = [
  { id: 'achilles', name: '阿喀琉斯', en: 'AQUILES', title: '特洛伊第一勇士', quote: 'La ira canta, oh diosa, del Pelida Aquiles.', quoteZh: '歌唱吧，女神，佩琉斯之子阿喀琉斯的愤怒。' },
  { id: 'odysseus', name: '奥德修斯', en: 'ODISEO', title: '智勇双全的航海者', quote: 'Dime, Musa, del hombre fecundo en recursos.', quoteZh: '告诉我，缪斯，那位足智多谋之人的故事。' },
  { id: 'hector', name: '赫克托尔', en: 'HECTOR', title: '特洛伊守护者', quote: 'Héctor, domador de caballos, brillante como el casco.', quoteZh: '赫克托尔，驯马者，头盔如星辰般闪耀。' },
  { id: 'paris', name: '帕里斯', en: 'PARIS', title: '弓手王子', quote: 'Paris, el de hermosas vestiduras, nacido para el amor.', quoteZh: '帕里斯，衣饰华美之人，为爱而生。' },
  { id: 'menelaus', name: '墨涅拉俄斯', en: 'MENELAO', title: '斯巴达之王', quote: 'Menelao, de buen grito de guerra, lanza de bronce.', quoteZh: '墨涅拉俄斯，战吼响亮，青铜长矛的主人。' },
  { id: 'diomedes', name: '狄俄墨得斯', en: 'DIOMEDES', title: '勇猛无双', quote: 'Diomedes, el de corazón de león, azote de los troyanos.', quoteZh: '狄俄墨得斯，狮心之人，特洛伊人的鞭挞。' },
  { id: 'nestor', name: '涅斯托尔', en: 'NESTOR', title: '智慧长者', quote: 'Néstor, el dulce orador, de voz que fluye como la miel.', quoteZh: '涅斯托尔，甜蜜的演说者，声如蜜流。' },
  { id: 'ajax', name: '大埃阿斯', en: 'ÁYAX', title: '巨盾英雄', quote: 'Áyax, el baluarte de los aqueos, escudo como torre.', quoteZh: '埃阿斯，希腊人的壁垒，盾如高塔。' },
  { id: 'agamemnon', name: '阿伽门农', en: 'AGAMENÓN', title: '联军统帅', quote: 'Agamenón, señor de los hombres, rey de Micenas.', quoteZh: '阿伽门农，万军之主，迈锡尼之王。' },
  { id: 'patroclus', name: '帕特罗克洛斯', en: 'PATROCLO', title: '忠义之友', quote: 'Patroclo, el de corazón compasivo, compañero fiel.', quoteZh: '帕特罗克洛斯，心怀悲悯，忠实的同伴。' },
]

// 西班牙语世界城市系列
export const CITIES = [
  { id: 'madrid', name: '马德里', en: 'MADRID', title: '西班牙首都', quote: 'Del Manzanares, puente y villa, Madrid, la que nunca duerme.', quoteZh: '曼萨纳雷斯河上的桥与城，永不沉睡的马德里。' },
  { id: 'sagrada', name: '巴塞罗那', en: 'BARCELONA', title: '高迪之城', quote: 'Barcelona, donde la imaginación de Gaudí toca el cielo.', quoteZh: '巴塞罗那，高迪的想象触碰天空之处。' },
  { id: 'sevilla', name: '塞维利亚', en: 'SEVILLA', title: '弗拉门戈之乡', quote: 'Sevilla, corazón de Andalucía, cuna del flamenco y la naranja.', quoteZh: '塞维利亚，安达卢西亚之心，弗拉门戈与橙花之乡。' },
  { id: 'baires', name: '布宜诺斯艾利斯', en: 'BUENOS AIRES', title: '探戈之都', quote: 'Buenos Aires, la París de Sudamérica, donde el tango respira.', quoteZh: '布宜诺斯艾利斯，南美巴黎，探戈在此呼吸。' },
  { id: 'mexico', name: '墨西哥城', en: 'CIUDAD DE MÉXICO', title: '阿兹特克故都', quote: 'Ciudad de México, sobre las ruinas de Tenochtitlán.', quoteZh: '墨西哥城，特诺奇蒂特兰废墟之上。' },
  { id: 'lima', name: '利马', en: 'LIMA', title: '王者之城', quote: 'Lima, la Ciudad de los Reyes, junto al Pacífico eterno.', quoteZh: '利马，王者之城，倚靠永恒太平洋。' },
  { id: 'hawana', name: '哈瓦那', en: 'LA HABANA', title: '加勒比明珠', quote: 'La Habana, de coches antiguos y paredes de colores.', quoteZh: '哈瓦那，老爷车与彩色墙壁之城。' },
  { id: 'bogota', name: '波哥大', en: 'BOGOTÁ', title: '咖啡高原', quote: 'Bogotá, la Atenas de Sudamérica, en la altiplanicie andina.', quoteZh: '波哥大，南美雅典，安第斯高原之上。' },
  { id: 'santiago', name: '圣地亚哥', en: 'SANTIAGO', title: '安第斯门户', quote: 'Santiago de Chile, a los pies de los Andes nevados.', quoteZh: '智利圣地亚哥，白雪皑皑的安第斯山脚下。' },
  { id: 'sanjuan', name: '圣胡安', en: 'SAN JUAN', title: '加勒比海岸', quote: 'San Juan, donde el Caribe abraza las murallas antiguas.', quoteZh: '圣胡安，加勒比海拥抱古老城墙之处。' },
]

export const AVATAR_SERIES = [
  { id: 'iliad', name: '荷马史诗系列', items: HEROES },
  { id: 'cities', name: '西语世界城市系列', items: CITIES },
]

// SVG 文本缓存，避免重复 fetch
const svgCache = {}

async function loadSvg(id) {
  if (svgCache[id]) return svgCache[id]
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}avatars/${id}.svg`)
    const text = await res.text()
    svgCache[id] = text
    return text
  } catch {
    return null
  }
}

// 从 SVG 文本中提取内部内容（去掉外层 <svg> 标签），用内联 svg 重新包裹
// 这样可以统一控制 viewBox 和大小，并让刻线保留真实颜色
function extractInner(svgText) {
  if (!svgText) return null
  // 去掉 xml 声明和外层 svg 标签，只保留内部元素
  const m = svgText.replace(/<\?xml.*?\?>/s, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  return m ? m[1] : null
}

// 头像组件 — 陶土圆底 + 黑釉剪影内联 SVG
import { useEffect, useState } from 'react'

export default function GreekAvatar({ hero, size = 64, showRing = true }) {
  const all = [...HEROES, ...CITIES]
  const h = all.find(x => x.id === hero) || all[0]
  const [inner, setInner] = useState(null)

  useEffect(() => {
    let mounted = true
    loadSvg(h.id).then((text) => {
      if (mounted) setInner(extractInner(text) || '')
    })
    return () => { mounted = false }
  }, [h.id])

  const border = Math.max(2, size * 0.04)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 28%, #C96B3B 0%, #B0572A 55%, #8C3F1E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.22), inset 0 2px 5px rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.25)',
      border: `${border}px solid #1A1A1A`,
      position: 'relative', flexShrink: 0, overflow: 'hidden',
    }}>
      {showRing && <div style={{
        position: 'absolute', inset: size * 0.09,
        border: `${Math.max(1, size * 0.018)}px solid rgba(26,26,26,0.45)`,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 2,
      }} />}
      {inner && (
        <svg
          viewBox="0 0 100 100"
          width={size * 0.66}
          height={size * 0.66}
          style={{ zIndex: 1, display: 'block' }}
          dangerouslySetInnerHTML={{ __html: inner }}
        />
      )}
    </div>
  )
}