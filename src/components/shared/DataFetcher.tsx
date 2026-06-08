import { useEffect, useState, type ReactNode } from 'react'

/**
 * Render Props Pattern (Week 12).
 * Mengambil data dari sebuah fungsi async lalu menyerahkan rendering ke pemanggil.
 *
 * Catatan: sejak migrasi ke Redux + localStorage, komponen ini tidak lagi terikat
 * ke JSON Server. `fetcher` bisa berupa pemanggilan apa pun yang mengembalikan Promise
 * (mis. membaca dari store, localStorage, atau API publik).
 *
 * Contoh:
 *   <DataFetcher<Product[]> fetcher={() => Promise.resolve(products)} render={(data, loading) =>
 *     loading ? <Spinner/> : <List items={data ?? []} />
 *   } />
 */
interface Props<T> {
  fetcher: () => Promise<T>
  render: (data: T | null, loading: boolean, error: string | null) => ReactNode
}

export default function DataFetcher<T>({ fetcher, render }: Props<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetcher()
      .then((result) => {
        if (active) {
          setData(result)
          setError(null)
        }
      })
      .catch(() => {
        if (active) setError('Gagal memuat data.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [fetcher])

  return <>{render(data, loading, error)}</>
}
