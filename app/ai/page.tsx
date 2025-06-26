import { auth } from "@/auth"
import signOut from "@/app/lib/signout";

export default async function Assistant() {
    const session = await auth();
    const user = session?.user;

    return (
        <div>
            <h1>Welcome {user!.name} to APEX</h1>
            <form action={signOut}>
                <button type="submit">Sign Out</button>
            </form>
        </div>
    )
    
}