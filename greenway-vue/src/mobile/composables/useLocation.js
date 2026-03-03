/**
 * 定位与距离计算 Composable
 * 管理用户实时位置，提供 Haversine 公式距离计算
 */
import { ref, computed } from 'vue'
import { getCurrentLocation } from './useCapacitor'

// ─── 单例状态（跨组件共享）─────────────────────────────
const userLocation = ref(null)   // { lat, lng, accuracy }
const locationStatus = ref('idle')  // 'idle' | 'loading' | 'success' | 'denied' | 'error'
const locationError = ref(null)

// ─── Haversine 公式 ──────────────────────────────────────
/**
 * 计算两点间球面距离（km）
 * @param {number} lat1 起点纬度
 * @param {number} lng1 起点经度
 * @param {number} lat2 终点纬度
 * @param {number} lng2 终点经度
 * @returns {number} 距离（km）
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371  // 地球半径 km
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * 格式化距离为可读字符串
 * @param {number} km 距离（km）
 * @returns {string} 例如 "1.2 km" 或 "800 m"
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// ─── Composable ──────────────────────────────────────────
export function useLocation() {
  const isLocating = computed(() => locationStatus.value === 'loading')
  const hasLocation = computed(() => locationStatus.value === 'success' && userLocation.value !== null)

  /**
   * 获取当前位置（可重复调用）
   * @param {boolean} silent 静默失败（不更新 error 状态）
   */
  const fetchLocation = async (silent = false) => {
    if (locationStatus.value === 'loading') return
    locationStatus.value = 'loading'
    locationError.value = null
    try {
      const loc = await getCurrentLocation()
      userLocation.value = { lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy }
      locationStatus.value = 'success'
    } catch (err) {
      if (!silent) {
        const msg = err?.message || '定位失败'
        if (msg.includes('denied') || msg.includes('permission') || msg.includes('Permission')) {
          locationStatus.value = 'denied'
          locationError.value = '位置权限被拒绝，请在设置中开启'
        } else {
          locationStatus.value = 'error'
          locationError.value = '无法获取位置，请检查网络或重试'
        }
      } else {
        locationStatus.value = 'idle'
      }
      userLocation.value = null
    }
  }

  /**
   * 计算用户到某坐标的距离
   * @param {number} lat 目标纬度
   * @param {number} lng 目标经度
   * @returns {number|null} 距离（km）或 null（未定位）
   */
  const distanceTo = (lat, lng) => {
    if (!userLocation.value) return null
    return haversineDistance(userLocation.value.lat, userLocation.value.lng, lat, lng)
  }

  return {
    userLocation,
    locationStatus,
    locationError,
    isLocating,
    hasLocation,
    fetchLocation,
    distanceTo,
    formatDistance,
    haversineDistance
  }
}
