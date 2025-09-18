// services/emergencyService.ts (or wherever you defined it)
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Your Firebase config

export interface EmergencyReportPayload { // Data expected in the notification payload
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string; // UID or name of the user reporting
  reporterContactNumber: string; // Explicitly name it for clarity if different from your admin contact
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  clientDateTime?: string; // Optional: if the client sends its own timestamp string
  // Any other relevant fields sent by the user app
}

export interface EmergencyReport {
  id: string;
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string;
  contactNumber: string; // This will be the reporterContactNumber
  dateTime: Timestamp;
  status: 'Pending' | 'Responded' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
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
    };

    const docRef = await addDoc(collection(db, "emergency_reports"), newReportData);
    console.log("Emergency report from notification saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving emergency report from notification: ", error);
    return null;
  }
};
