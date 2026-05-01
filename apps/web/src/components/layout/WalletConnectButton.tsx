import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { Wallet } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

type WalletConnectButtonProps = {
  className?: string
}

export function WalletConnectButton({ className }: WalletConnectButtonProps) {
  return (
    <ConnectButton
      className={cn(
        'focus-ring inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-electric-blue bg-electric-blue px-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(18,102,255,0.28)] transition-colors hover:bg-blue-500',
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Connect Sui Wallet
      </span>
    </ConnectButton>
  )
}
