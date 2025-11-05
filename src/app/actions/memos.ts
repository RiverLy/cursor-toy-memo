'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Memo, MemoFormData } from '@/types/memo'

// Helper function to convert Supabase row to Memo type
function mapToMemo(row: any): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getMemos(): Promise<Memo[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching memos:', error)
    return []
  }

  return data.map(mapToMemo)
}

export async function getMemoById(id: string): Promise<Memo | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching memo:', error)
    return null
  }

  return mapToMemo(data)
}

export async function createMemo(formData: MemoFormData): Promise<Memo> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('memos')
    .insert({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating memo:', error)
    throw new Error('Failed to create memo')
  }

  revalidatePath('/')
  return mapToMemo(data)
}

export async function updateMemo(
  id: string,
  formData: MemoFormData
): Promise<Memo> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('memos')
    .update({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags || [],
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating memo:', error)
    throw new Error('Failed to update memo')
  }

  revalidatePath('/')
  return mapToMemo(data)
}

export async function deleteMemo(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('memos').delete().eq('id', id)

  if (error) {
    console.error('Error deleting memo:', error)
    throw new Error('Failed to delete memo')
  }

  revalidatePath('/')
}

