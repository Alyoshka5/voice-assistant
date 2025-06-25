import { auth } from "@/auth"
import { redirect } from "next/navigation";

export default async function Assistant() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }
    const user = session.user;

    return <h1>Welcome {user!.name} to APEX</h1>
}