import { SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';

export interface MediaItem{
    mediaItemId: Observable<number>;
    patientMediaItemId: number;
    mediaType: string;
    localURL: SafeUrl;
    remoteURL: string;
    isPrimary:boolean;
    datetime: Date|string;
    deleted: boolean;
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

  export interface MediaItemsDataObject{
    patientId: number;
    mediaItem: BehaviorSubject<MediaItem[]>;
  }