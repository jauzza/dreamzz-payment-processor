import { NextResponse } from 'next/server'
import { linkStorage } from '@/lib/link-storage'

export async function GET() {
  const allLinks = linkStorage.getAll()
  
  return NextResponse.json({
    count: allLinks.length,
    links: allLinks
  })
}