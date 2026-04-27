import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'

const getInitials = (email: string | undefined): string => {
  if (!email) return 'SN'
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || 'SN'
}

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const user = useAuthStore((s) => s.auth.user)

  const email = user?.email ?? 'guest@santain.mn'
  const role = user?.role?.[0] ?? 'staff'
  const displayName = email.split('@')[0] ?? 'guest'
  const initials = getInitials(user?.email)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative h-9 w-9 rounded-full border border-[#e2e5ea] bg-white p-0 hover:bg-[#f8f9fb]'
          >
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-white text-xs font-semibold text-[#1a2744]'>
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-60 border-[#e2e5ea] bg-white text-[#1a2744] shadow-md'
          align='end'
          forceMount
        >
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm leading-none font-medium'>
                {displayName}
              </p>
              <p className='text-xs leading-none text-[#5a6577]'>{email}</p>
              <p className='mt-1 inline-flex w-fit rounded bg-[#C9A84C]/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#C9A84C] uppercase'>
                {role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-[#e2e5ea]' />
          <DropdownMenuItem
            variant='destructive'
            onClick={() => setOpen(true)}
            className='cursor-pointer'
          >
            Sign out
            <DropdownMenuShortcut className='text-current'>
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
