

  export interface Comment {
    userId: number;
    commentId: number;
    comment: string;
    timestamp: string;
    userColour: string;
    userInitials: string;
    userName?:string | null;
  }