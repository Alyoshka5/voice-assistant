import { auth } from "@/auth"

export default async function Assistant() {
    const session = await auth();
    const user = session?.user;

    return <h1>Welcome {user!.name} to APEX</h1>
}