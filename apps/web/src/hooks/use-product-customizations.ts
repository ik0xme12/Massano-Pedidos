'use client'

import { supabase } from '@/lib/supabase'
import type { ProductCustomization } from '@/components/products/CustomizeModal'

export function useProductCustomizations() {
  const saveCustomization = async (
    userId: string,
    productId: string,
    customization: ProductCustomization
  ) => {
    const { error } = await supabase
      .from('product_customizations')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          customization_data: customization,
        },
        {
          onConflict: 'user_id,product_id',
        }
      )

    if (error) throw error
  }

  const getCustomization = async (userId: string, productId: string) => {
    const { data, error } = await supabase
      .from('product_customizations')
      .select('customization_data')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return (data?.customization_data as ProductCustomization) || null
  }

  return { saveCustomization, getCustomization }
}
