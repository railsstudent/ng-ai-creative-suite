import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild, afterRenderEffect } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  isOpen = input(false);
  confirmText = input('Confirm');
  cancelText = input('Cancel');

  confirm = output<void>();
  cancel = output<void>();

  dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterRenderEffect({
      write: () => {
        const dialogEl = this.dialog()?.nativeElement;
        if (!dialogEl) {
          return;
        }

        if (this.isOpen() && !dialogEl.open) {
          dialogEl.showModal();
        } else if (!this.isOpen() && dialogEl.open) {
          dialogEl.close();
        }
      }
    });
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
