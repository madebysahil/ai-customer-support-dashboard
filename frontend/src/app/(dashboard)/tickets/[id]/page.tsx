"use client"

import { useParams } from "next/navigation"
import { TicketWorkspace } from "@/components/tickets/TicketWorkspace"

export default function TicketDetailsRoute() {
  const { id } = useParams()
  return <TicketWorkspace initialTicketId={id as string} />
}
