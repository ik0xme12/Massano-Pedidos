import { PedidoContent } from './pedido-content'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PedidoPage({ params }: PageProps) {
  const { id } = await params
  return <PedidoContent orderId={id} />
}
