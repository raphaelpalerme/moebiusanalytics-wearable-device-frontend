export interface Patient {
    id: number;
    carePathwayId: string;
    firstName: string;
    lastName: string;
    deviceId: string | null;
    anesthesiaDate: string;
    surgeryDate: string;
}