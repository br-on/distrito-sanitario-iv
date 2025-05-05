'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus } from 'lucide-react'
import { useEffect, useOptimistic, useState, useTransition } from 'react'
import { getStats, incrementAndLog } from './counter'

export default function Home() {
  const [stats, setStats] = useState<{ count: number; recentAccess: { accessed_at: string }[] }>({
    count: 0,
    recentAccess: []
  })
  const [optimisticStats, setOptimisticStats] = useOptimistic(stats)
  const [_, startTransition] = useTransition()

  useEffect(() => {
    getStats().then(setStats)
  }, [])

  const handleClick = async () => {
    startTransition(async () => {
      setOptimisticStats({
        count: optimisticStats.count + 1,
        recentAccess: [{ accessed_at: new Date().toISOString() }, ...optimisticStats.recentAccess.slice(0, 4)]
      })
      const newStats = await incrementAndLog()
      setStats(newStats)
    })
  }

  return (
    <main className="p-6 flex flex-col items-center space-y-6">
    <Card className="w-full max-w-md p-6 shadow-xl flex flex-col min-h-[220px] bg-brand-300 bg-opacity-80">
      <CardTitle className="text-2xl font-semibold mb-5 text-brand-50">
        Informações do Perfil
      </CardTitle>
        <p><strong>Nome:</strong> Bruno Gama</p>
        <p><strong>Cargo:</strong> <span style={{ color: 'red' }}>Administrador do sistema</span></p>
        <p><strong>Unidade de saúde:</strong> USF+ CARANGUEJO</p>
        <p><strong>Equipe:</strong> ESF Caranguejo I</p>
        <div className="mt-auto flex justify-end pt-4">
          <Link href="/profile">
            <Button variant="secondary">
              Editar Perfil
            </Button>
          </Link>
        </div>
    </Card>

    <div className="flex space-x-4">
      <Link rel="import" href="/apps">
        <Button variant="default" className="flex items-center gap-2 bg-brand-200">
          <Plus size={16} /> Hub de Aplicativos
        </Button>
      </Link>
      
    </div>
  </main>
  )
}
