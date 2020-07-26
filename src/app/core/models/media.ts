import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

export interface MediaItem{
    mediaItemId: number;
    mediaType: string;
    localURL: SafeUrl;
    remoteURL: string;
    datetime: Date|string;
    comment: string;
    patientId: number;
    heightPX: number;
    widthPX: number;
    tags: string[],
    uploadProgress: Observable<number>,
    updated: boolean
  }

