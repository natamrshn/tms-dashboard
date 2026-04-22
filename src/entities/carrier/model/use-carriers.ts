import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/config/query-keys'
import { getCarriers } from '@/shared/api/carriers'

export function useCarriers(search?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.carriers.list(search),
    queryFn: () => getCarriers(search),
  })
}
