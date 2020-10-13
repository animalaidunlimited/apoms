import { SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';

export interface MediaItem{
    mediaItemId: Observable<number>;
    mediaType: string;
    localURL: SafeUrl;
    remoteURL: string | null;
    datetime: Date|string;
    comment: string;
    patientId: number;
    heightPX: number;
    widthPX: number;
    tags: string[];
    uploadProgress$: Observable<number> | null;
    updated: boolean;
  }

  export interface MediaItemReturnObject{
    mediaItem: MediaItem | undefined;
    mediaItemId: BehaviorSubject<number | undefined>;
    result: string;
  }