// instrumentation.ts (in root directory)
export async function register() {
  if (process.env.NODE_ENV === 'development') {
    // Load environment variables in development
    const { config } = await import('dotenv')
    const { resolve } = await import('path')
    
    const result = config({ 
      path: resolve(process.cwd(), '.env.local') 
    })
    
    if (result.error) {
      console.error('Failed to load .env.local:', result.error)
    } else {
      console.log('✅ Environment variables loaded from .env.local')
    }
  }
}