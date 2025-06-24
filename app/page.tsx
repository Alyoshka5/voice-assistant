import primaryFont from "./fonts";

export default function Home() {
  return (
    <div>
      <h1>Welcome to APEX</h1>
      <div>
        <p>Get started:</p>
        <input type="button" className={`${primaryFont.className}`}value="Sign in with Google" />
      </div>
    </div>
  );
}
