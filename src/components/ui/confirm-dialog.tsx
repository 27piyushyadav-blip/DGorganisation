import Swal from 'sweetalert2';

interface ConfirmDialogOptions {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'error' | 'info' | 'question' | 'success';
}

export const showConfirmDialog = async (options: ConfirmDialogOptions): Promise<boolean> => {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: options.confirmButtonText || 'Yes, delete it!',
    cancelButtonText: options.cancelButtonText || 'Cancel',
  });

  return result.isConfirmed;
};

export const showSuccessToast = (message: string) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showErrorToast = (message: string) => {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};