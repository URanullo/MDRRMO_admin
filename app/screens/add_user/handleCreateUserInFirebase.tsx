import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { Alert } from 'react-native';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  barangay: string;
  contactNumber: string;
  role?: string;
  createdAt: Timestamp;
}

async function handleCreateUserInFirebase(
  email: string,
  password: string,
  profileDetails: Omit<UserProfile, 'uid' | 'email' | 'createdAt'>
): Promise<User | null> {
  if (!email || !password || !profileDetails.firstName || !profileDetails.lastName || !profileDetails.barangay) {
    Alert.alert('Missing Information', 'Please fill in all required fields (Email, Password, First Name, Last Name, Barangay).');
    return null;
  }

  try {
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User created in Firebase Auth:', user.uid);

    const userProfileData: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      ...profileDetails,
      role: profileDetails.role || 'user',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfileData);
    console.log('User profile stored in Firestore for UID:', user.uid);

    Alert.alert('User Added', `User ${userProfileData.firstName} ${userProfileData.lastName} has been successfully created.`);
    return user;

  } catch (error: any) {
    console.error('Error creating user:', error);
    // Handle specific Firebase Auth errors
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'The email address is not valid.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak. Please use a stronger password.';
    }
    Alert.alert('Error Creating User', errorMessage);
    return null;
  }
}

export default handleCreateUserInFirebase;

