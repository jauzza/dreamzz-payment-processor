import { NextRequest, NextResponse } from 'next/server'
import { memberStorage } from '@/lib/member-storage'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    switch (action) {
      case 'stats':
        return NextResponse.json(memberStorage.getStats())
        
      case 'expired':
        const expired = memberStorage.getExpiredMonthlyMembers()
        return NextResponse.json({
          count: expired.length,
          members: expired.map(m => ({
            userId: m.userId,
            username: m.username,
            firstName: m.firstName,
            plan: m.plan,
            subscriptionEnd: m.subscriptionEnd,
            daysExpired: m.subscriptionEnd ? Math.floor((Date.now() - m.subscriptionEnd) / (24 * 60 * 60 * 1000)) : 0
          }))
        })
        
      case 'monthly':
        const monthly = memberStorage.getMembersByPlan('monthly')
        return NextResponse.json({
          count: monthly.length,
          members: monthly.map(m => ({
            userId: m.userId,
            username: m.username,
            firstName: m.firstName,
            subscriptionEnd: m.subscriptionEnd,
            daysRemaining: m.subscriptionEnd ? Math.floor((m.subscriptionEnd - Date.now()) / (24 * 60 * 60 * 1000)) : 0
          }))
        })
        
      case 'lifetime':
        const lifetime = memberStorage.getMembersByPlan('lifetime')
        return NextResponse.json({
          count: lifetime.length,
          members: lifetime.map(m => ({
            userId: m.userId,
            username: m.username,
            firstName: m.firstName,
            joinedAt: m.joinedAt
          }))
        })
        
      default:
        // Return all members
        return NextResponse.json({
          stats: memberStorage.getStats(),
          all: memberStorage.getAll()
        })
    }
    
  } catch (error: any) {
    console.error('❌ Members API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}