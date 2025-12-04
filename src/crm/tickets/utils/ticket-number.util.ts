/**
 * Generate a sequential ticket number
 * Format: TKT-000001, TKT-000002, etc.
 */
export async function generateTicketNumber(
  prisma: any,
): Promise<string> {
  // Get the highest ticket number
  const lastTicket = await prisma.ticket.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { ticketNumber: true },
  });

  let nextNumber = 1;
  if (lastTicket?.ticketNumber) {
    // Extract number from format TKT-000001
    const match = lastTicket.ticketNumber.match(/TKT-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format with leading zeros (6 digits)
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `TKT-${paddedNumber}`;
}

