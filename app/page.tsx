import TestCredentialsForm from "./components/TestCredentialsForm";
import primaryFont from "./fonts";
import googleSignIn from "@/app/actions/google-signin";

export default function Home() {
    return (
        <div>
            <h1>Welcome to APEX</h1>
            <form action={googleSignIn}>
                <p>Get started:</p>
                <button type="submit" className={`${primaryFont.className}`}>Sign in with Google</button>
            </form>
            {process.env.APP_ENV === 'test' && (
                <TestCredentialsForm />
            )}
        </div>
    );
}
