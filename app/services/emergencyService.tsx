// services/emergencyService.ts (or wherever you defined it)
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Your Firebase config

export interface EmergencyReportPayload {
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string;
  reporterContactNumber: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  clientDateTime?: string;
  images?: string[];
  imageUrl?: string;
  image?: string;
}

export interface EmergencyReport {
  id: string;
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string;
  contactNumber: string;
  dateTime: Timestamp;
  status: 'Pending' | 'Responded' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  images: string[];
}

export const saveNewEmergencyReport = async (
  payload: EmergencyReportPayload
): Promise<string | null> => {
  try {
    const newReportData: Omit<EmergencyReport, 'id'> = {
      type: payload.type || 'Unknown Type',
      description: payload.description || 'No description',
      location: payload.location || 'Unknown Location',
      barangay: payload.barangay || 'Unknown Barangay',
      reportedBy: payload.reportedBy || 'Anonymous',
      contactNumber: payload.reporterContactNumber || 'N/A', // Use the specific field from payload
      priority: payload.priority || 'Medium', // Default priority
      status: 'Pending',
      dateTime: payload.clientDateTime
        ? Timestamp.fromDate(new Date(payload.clientDateTime))
        : serverTimestamp() as Timestamp,
      images: payload.images ?? [],
    };

    const docRef = await addDoc(collection(db, "emergency_reports"), newReportData);
    console.log("Emergency report from notification saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving emergency report from notification: ", error);
    return null;
  }
};
