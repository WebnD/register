interface Register{
    name: string;
      roll: string;
      email: string;
      phone: string;
      reason: string;
      projects: string;
      remarks?: string;
      rating?: number;
      status?: string;
      panelName?: string;
      $id?: string;
}

interface Update{
  scannedData: string;
      rating: number;
      status: string;
      remarks: string;
      panelName:string;
}
