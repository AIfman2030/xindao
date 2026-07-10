/**
 * Simple WebFetch utility for the app
 */

export class WebFetch {
  static async get(url: string, prompt?: string): Promise<string> {
    try {
      const response = await fetch(url)
      return await response.text()
    } catch (error) {
      console.error('WebFetch error:', error)
      return ''
    }
  }
}