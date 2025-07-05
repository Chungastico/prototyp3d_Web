import { auth, db } from "@/firebase/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    UserCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Extendemos UserCredential para incluir additionalUserInfo con isNewUser
interface ExtendedUserCredential extends UserCredential {
    additionalUserInfo?: {
        isNewUser?: boolean;
    };
}

// 🔐 Registrar usuario con email + password
export const registerUser = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar correo
    await sendEmailVerification(user);

    // Guardar info adicional en Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "cliente",
        createdAt: serverTimestamp(),
    });

    return user;
};

// 🔓 Iniciar sesión con email + password
export const loginUser = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

// 🚪 Cerrar sesión
export const logoutUser = async () => {
    await signOut(auth);
};

// 🔑 Login con Google
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider) as ExtendedUserCredential;
        const user = result.user;

        if (result.additionalUserInfo?.isNewUser) {
            await setDoc(doc(db, "usuarios", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "cliente",
                createdAt: serverTimestamp(),
            });
        }

        return user;
    } catch (error: unknown) {
        if (error instanceof Error) throw error;
        else throw new Error("Error desconocido");
    }
};
