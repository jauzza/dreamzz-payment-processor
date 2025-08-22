import { NextRequest, NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false })

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()
    
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL required' }, { status: 400 })
    }
    
    // Set webhook for Telegram bot
    const result = await bot.setWebHook(webhookUrl)
    
    console.log('🔗 Telegram webhook set:', webhookUrl)
    console.log('✅ Webhook result:', result)
    
    // Get webhook info to verify
    const webhookInfo = await bot.getWebHookInfo()
    
    return NextResponse.json({
      success: true,
      webhookUrl: webhookInfo.url,
      pendingUpdateCount: webhookInfo.pending_update_count,
      lastErrorDate: webhookInfo.last_error_date,
      lastErrorMessage: webhookInfo.last_error_message
    })
    
  } catch (error: any) {
    console.error('❌ Error setting Telegram webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get current webhook info
    const webhookInfo = await bot.getWebHookInfo()
    
    return NextResponse.json({
      currentWebhook: webhookInfo.url,
      pendingUpdateCount: webhookInfo.pending_update_count,
      lastErrorDate: webhookInfo.last_error_date,
      lastErrorMessage: webhookInfo.last_error_message
    })
    
  } catch (error: any) {
    console.error('❌ Error getting Telegram webhook info:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}