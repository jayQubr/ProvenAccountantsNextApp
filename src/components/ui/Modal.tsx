import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'

const Modal = ({ open, handleOpenChange, children }: { open: boolean, handleOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="rounded-md bg-sky-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">
          Get Started
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="text-2xl font-bold text-gray-900">
            Introduction Form
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-600">
            Please fill out the form below to get started with our services.
          </Dialog.Description>
          {children}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal