import { NextRequest, NextResponse } from 'next/server'
import { memberStorage } from '@/lib/member-storage'

export async function POST(request: NextRequest) {
  try {
    const { type = 'expired' } = await request.json()
    
    if (type === 'expired') {
      // Add a test member whose subscription has "expired"
      const now = Date.now()
      const joinedDate = now - (32 * 24 * 60 * 60 * 1000) // 32 days ago
      const expiredDate = now - (2 * 24 * 60 * 60 * 1000) // 2 days ago
      
      memberStorage.addMember({
        userId: 123456789, // Fake user ID for testing
        username: 'test_user',
        firstName: 'Test',
        lastName: 'User',
        plan: 'monthly',
        joinedAt: joinedDate,
        subscriptionStart: joinedDate,
        subscriptionEnd: expiredDate, // Subscription ended 2 days ago
        sessionId: 'test_session_123',
        active: true
      })
      
      return NextResponse.json({
        success: true,
        message: 'Added expired test member',
        member: {
          userId: 123456789,
          username: 'test_user',
          firstName: 'Test',
          plan: 'monthly',
          daysExpired: 2
        }
      })
    }
    
    if (type === 'active') {
      // Add a test member with active subscription
      const now = Date.now()
      
      memberStorage.addMember({
        userId: 987654321,
        username: 'active_user',
        firstName: 'Active',
        lastName: 'User',
        plan: 'monthly',
        joinedAt: now,
        subscriptionStart: now,
        subscriptionEnd: now + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        sessionId: 'test_session_456',
        active: true
      })
      
      return NextResponse.json({
        success: true,
        message: 'Added active test member',
        member: {
          userId: 987654321,
          username: 'active_user',
          firstName: 'Active',
          plan: 'monthly',
          daysRemaining: 28
        }
      })
    }
    
    return NextResponse.json({ error: 'Invalid type. Use "expired" or "active"' }, { status: 400 })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Clear test members
    const allMembers = memberStorage.getAll()
    const testMembers = allMembers.filter(m => 
      m.userId === 123456789 || m.userId === 987654321
    )
    
    // In a real app you'd delete from database, here we'll mark as inactive
    testMembers.forEach(member => {
      memberStorage.deactivateMember(member.userId, 'Test cleanup')
    })
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${testMembers.length} test members`
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}