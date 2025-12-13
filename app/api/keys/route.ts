import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const { data: keys, error } = await supabase
      .from('vpn_keys')
      .select('*')
      .eq('user_id', user_id)

    if (error) {
      console.error('Error fetching keys:', error)
      return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 })
    }

    const formattedKeys = (keys || []).map(key => key.config)

    return NextResponse.json(formattedKeys)
  } catch (error) {
    console.error('Error in keys API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
