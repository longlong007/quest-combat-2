import { getLocalGuidance } from './local'

export interface GuidanceProvider {
  getGuidance(intentTag: string): string
}

// MVP: 本地静态引导语库
// 未来可替换为 LLM provider，通过配置切换
export const localGuidanceProvider: GuidanceProvider = {
  getGuidance: getLocalGuidance,
}

// 当前使用的 provider（可注入替换）
export function getGuidance(intentTag: string): string {
  return localGuidanceProvider.getGuidance(intentTag)
}