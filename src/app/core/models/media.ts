import { SafeUrl } from '@angular/platform-browser';

import { Observable, BehaviorSubject } from 'rxjs';

  export interface MediaItem{
    datetime: Date|string;
    deleted: boolean;
    heightPX: number;
    isPrimary: boolean;
    localURL: SafeUrl;
    mediaItemId: Observable<number>;
    mediaType: string;
    organisationMediaItemId?: number;
    patientId: number;
    patientMediaItemId?: number;
    remoteURL: string;
    tags: Tag[] | string[];
    uploadProgress$: Observable<number> | null;
    updated: boolean;
    widthPX: number;
  }


  export interface LocalMediaItem{
    patientId: number;
    headerType: string;
    media: LocalMedia[];
  }

  export interface LocalMedia{
    date: string | null;
    imageBase64 : string;
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

  export interface MediaUploadResponse{
    success: number;
    mediaItemId: number;
  }

  export interface SingleMediaItem {
    upload: boolean,
    patientId: number,
    tagNumber: string,
    mediaData: MediaItem | undefined
  }
  export interface SharedMediaPackage{
    message: string;
    image: File[];
    video: File[];
  }

  export interface Image {
    thumbnail: string;
    full: string;
    type: string;
    time?: string | null;
    date?: string | null;
    tags?: any;
    patientMediaItemId?:number | null;
    height?: number;
    width?: number;
  }
  export interface Gallery {
    date: string;
    images: Image[];
  }

  export interface Tag {
    tag: string;
  }
  export interface MediaResponse {
    tags: Tag[];
    widthPX: number;
    comments: Comment[];
    datetime: Date;
    heightPX: number;
    localURL?: any;
    isPrimary: number;
    mediaType: string;
    patientId: number;
    remoteURL: string;
    mediaItemId: number;
}