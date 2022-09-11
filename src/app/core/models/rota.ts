export interface Role{
    roleId: number;
    role: string;
    color: string
  }
  
export interface Rota{
    rotaId: number;
    rotaName: string;
    defaultRota: boolean;
    rotaVersions: RotaVersion[]
  }
  
export interface RotaVersion{
    rotaId: number;
    rotaVersionId: number;
    rotaVersionName: string;
    defaultRotaVersion: boolean;
  }

export interface CurrentRota {
    rotaId: number | undefined;
    rotaName: string | undefined;
    defaultRota: boolean | undefined;
    rotaVersionId: number | undefined;
    rotaVersionName: string | undefined;
    defaultRotaVersion: boolean | undefined;
    editing: boolean;
}