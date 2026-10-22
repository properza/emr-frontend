import Swal, { type SweetAlertIcon } from 'sweetalert2'

type DialogType = 'success' | 'warning' | 'error' | 'info' | 'confirm'
interface DialogOptions { type?: DialogType; title?: string }

const icons: Record<DialogType, SweetAlertIcon> = {
  success: 'success', warning: 'warning', error: 'error', info: 'info', confirm: 'question',
}

export function useDialog() {
  function alert(message: string, opts: DialogOptions = {}): Promise<void> {
    return Swal.fire({
      icon: icons[opts.type ?? 'info'],
      title: opts.title || undefined,
      text: message,
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      customClass: { popup: 'emr-swal-popup' },
    }).then(() => undefined)
  }

  async function confirm(message: string, opts: DialogOptions = {}): Promise<boolean> {
    const result = await Swal.fire({
      icon: icons[opts.type ?? 'confirm'],
      title: opts.title || 'ยืนยัน',
      text: message,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
      customClass: { popup: 'emr-swal-popup', confirmButton: 'emr-swal-confirm', cancelButton: 'emr-swal-cancel' },
    })
    return result.isConfirmed
  }

  return { alert, confirm }
}
