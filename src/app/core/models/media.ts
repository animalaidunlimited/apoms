import { SafeUrl } from '@angular/platform-browser';
import { Observable, BehaviorSubject } from 'rxjs';

export interface MediaItem{
    mediaItemId: Observable<number>;
    patientMediaItemId: number;
    mediaType: string;
    localURL: SafeUrl;
    remoteURL: string;
    isPrimary: boolean;
    datetime: Date|string;
    deleted: boolean;
    comments: Comment[] | null;
    patientId: number;
    heightPX: number;
    widthPX: number;
    tags: Tag[] | string[];
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
    comments:Comment[] | null;
    patientMediaItemId?:number | null;
    height?: number;
    width?: number;
  }
  export interface Gallery {
    date: string;
    images: Image[];
  }

  export interface Comment {
    userId: number;
    comment: string;
    timestamp: string;
    userColour: string;
    userInitials: string;
    userName?:string | null;
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