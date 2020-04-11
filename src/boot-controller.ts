import { Subject } from 'rxjs';
export class BootController {
  private static instance: BootController;
  private _reboot: Subject<boolean> = new Subject();
  private reboot$ = this._reboot.asObservable();

  static getbootControl() {
    if (!BootController.instance) {
      BootController.instance = new BootController();
    }
    return BootController.instance;
  }

  public watchReboot() {
    return this.reboot$;
  }

  public restart() {
    this._reboot.next(true);
  }
}